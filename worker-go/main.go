package main

import (
  "bytes"
  "fmt"
  "log"
  "net/http"
  "os"

  amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
  if err != nil {
    log.Fatalf("%s: %s", msg, err)
  }
}

func process(body []byte) error {
  api := os.Getenv("NEST_API_URL")
  if api == "" {
    api = "http://api:3001"
  }

  url := fmt.Sprintf("%s/weather", api)
  resp, err := http.Post(url, "application/json", bytes.NewReader(body))
  if err != nil {
    return err
  }
  defer resp.Body.Close()

  if resp.StatusCode >= 400 {
    return fmt.Errorf("status %d", resp.StatusCode)
  }

  return nil
}

func main() {
  conn, err := amqp.Dial(os.Getenv("RABBITMQ_URL"))
  failOnError(err, "Failed to connect to RabbitMQ")
  defer conn.Close()

  ch, err := conn.Channel()
  failOnError(err, "Failed to open a channel")
  defer ch.Close()

  q, err := ch.QueueDeclare(
    os.Getenv("RABBITMQ_QUEUE"),
    true, false, false, false, nil,
  )
  failOnError(err, "Failed to declare a queue")

  msgs, err := ch.Consume(
    q.Name, "", false, false, false, false, nil)
  failOnError(err, "Failed to register a consumer")

  forever := make(chan bool)

  go func() {
    for d := range msgs {
      log.Printf("Received a message: %s", d.Body)

      err := process(d.Body)
      if err != nil {
        log.Printf("Processing error: %v — nack", err)
        d.Nack(false, true)
        continue
      }

      d.Ack(false)
    }
  }()

  log.Printf("Worker running, waiting for messages.")
  <-forever
}
