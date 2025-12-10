# collector-python/collector.py
import os, time, json, requests, pika

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://user:password@localhost:5672/")
QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_queue")
LAT = os.getenv("CITY_LAT", "-8.76077")
LON = os.getenv("CITY_LON", "-63.89993")
INTERVAL = int(os.getenv("FETCH_INTERVAL", "3600"))  # seconds

def fetch_weather():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {"latitude": LAT, "longitude": LON, "current_weather": True}
    r = requests.get(url, params=params)
    r.raise_for_status()
    data = r.json()
    cur = data.get("current_weather", {})
    payload = {
        "temperature": cur.get("temperature"),
        "windspeed": cur.get("windspeed"),
        "time": cur.get("time"),
        "raw": data
    }
    return payload

def send_message(payload):
    params = pika.URLParameters(RABBIT_URL)
    conn = pika.BlockingConnection(params)
    ch = conn.channel()
    ch.queue_declare(queue=QUEUE, durable=True)
    ch.basic_publish(exchange="", routing_key=QUEUE, body=json.dumps(payload), properties=pika.BasicProperties(delivery_mode=2))
    conn.close()

if __name__ == "__main__":
    while True:
        try:
            p = fetch_weather()
            send_message(p)
            print("Sent:", p)
        except Exception as e:
            print("Error:", e)
        time.sleep(INTERVAL)
