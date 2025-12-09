package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/streadway/amqp"
)

var (
	defaultRabbitURL = "amqp://user:password@rabbitmq:5672/"
	defaultQueue     = "weather_queue"
	defaultNestURL   = "http://api:3001/weather" // note: match your NestJS service port/route
)

// helper to get env with fallback
func getenv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

// exponential backoff with max cap
func backoff(attempt int) time.Duration {
	d := time.Duration(500*(1<<attempt)) * time.Millisecond
	max := 10 * time.Second
	if d > max {
		return max
	}
	return d
}

func main() {
	// env
	rabbitURL := getenv("RABBITMQ_URL", defaultRabbitURL)
	queueName := getenv("RABBITMQ_QUEUE", defaultQueue)
	nestBase := getenv("NEST_API_URL", "") // e.g. http://api:3001
	var nestURL string
	if nestBase == "" {
		nestURL = defaultNestURL
	} else {
		// Accept both with/without trailing slash
		nestURL = strings.TrimRight(nestBase, "/") + "/weather"
	}

	log.Printf("worker starting. rabbit=%s queue=%s -> nest=%s\n", rabbitURL, queueName, nestURL)

	// connect to rabbit
	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("failed to connect to rabbitmq: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("failed to open channel: %v", err)
	}
	defer ch.Close()

	// QoS: prefetch 1 so we process one message at a time (avoid overloading)
	if err := ch.Qos(1, 0, false); err != nil {
		log.Printf("warning: could not set qos: %v", err)
	}

	// declare queue in case it doesn't exist
	_, err = ch.QueueDeclare(
		queueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		log.Fatalf("queue declare failed: %v", err)
	}

	msgs, err := ch.Consume(
		queueName,
		"",    // consumer
		false, // autoAck -> manual ack
		false, // exclusive
		false, // noLocal
		false, // noWait
		nil,
	)
	if err != nil {
		log.Fatalf("failed to register consumer: %v", err)
	}

	// http client with timeout
	client := &http.Client{Timeout: 12 * time.Second}

	// graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		log.Printf("signal received: %v, shutting down...", sig)
		cancel()
		// allow some time for cleanup
		time.Sleep(1 * time.Second)
		_ = conn.Close()
		os.Exit(0)
	}()

	// worker goroutine
	go func() {
		for d := range msgs {
			select {
			case <-ctx.Done():
				log.Println("context cancelled, not processing more messages")
				return
			default:
				// continue
			}

			log.Printf("msg received: %d bytes", len(d.Body))

			// Validate JSON quickly
			var tmp interface{}
			if err := json.Unmarshal(d.Body, &tmp); err != nil {
				log.Printf("invalid json: %v. Acking to drop.", err)
				_ = d.Ack(false) // drop malformed messages
				continue
			}

			// Try to forward with retries
			if err := forwardWithRetries(client, nestURL, d.Body, 3); err != nil {
				// If permanent error, nack and requeue=false (drop) OR requeue true to retry later.
				// Here we'll requeue for transient failures, but after many retries the function above will return error.
				log.Printf("forward failed after retries: %v. Nacking (requeue=true).", err)
				_ = d.Nack(false, true) // requeue
				continue
			}

			// success -> ack
			if err := d.Ack(false); err != nil {
				log.Printf("ack failed: %v", err)
			} else {
				log.Println("ack ok")
			}
		}
	}()

	log.Println("worker is running, waiting messages...")
	// block until ctx cancelled
	<-ctx.Done()
	log.Println("worker exiting")
}

// forwardWithRetries will attempt to POST the payload to targetURL with retries and backoff.
// returns nil on success (2xx), or error after attempts exhausted.
func forwardWithRetries(client *http.Client, targetURL string, payload []byte, maxAttempts int) error {
	var lastErr error
	for attempt := 0; attempt < maxAttempts; attempt++ {
		status, err := postOnce(client, targetURL, payload)
		if err == nil && status >= 200 && status < 300 {
			return nil
		}

		if err != nil {
			lastErr = err
			log.Printf("post attempt %d failed: %v", attempt+1, err)
		} else {
			lastErr = fmt.Errorf("non-2xx response: %d", status)
			log.Printf("post attempt %d returned status %d", attempt+1, status)
		}

		// if it's likely a permanent client error (4xx), break and return permanent error
		if isPermanentHttpStatus(lastErr) {
			return lastErr
		}

		// sleep backoff before next attempt
		sleep := backoff(attempt)
		log.Printf("retrying in %v...", sleep)
		time.Sleep(sleep)
	}

	return lastErr
}

// postOnce posts JSON payload once, returns HTTP status and error
func postOnce(client *http.Client, url string, payload []byte) (int, error) {
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	return resp.StatusCode, nil
}

// isPermanentHttpStatus heuristics: treat 4xx (except 429) as permanent errors
func isPermanentHttpStatus(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	// Look for patterns like "non-2xx response: 400"
	if strings.Contains(msg, "non-2xx response:") {
		parts := strings.Split(msg, ":")
		if len(parts) >= 2 {
			var code int
			_, scanErr := fmt.Sscanf(parts[len(parts)-1], " %d", &code)
			if scanErr == nil {
				// treat 4xx (except 429) as permanent
				if code >= 400 && code < 500 && code != 429 {
					return true
				}
			}
		}
	}
	return false
}
