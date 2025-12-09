import os
import time
import json
import signal
import requests
import pika
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://user:password@rabbitmq:5672/")
QUEUE_NAME   = os.getenv("RABBITMQ_QUEUE", "weather_queue")

CITY_LAT     = os.getenv("CITY_LAT", "-8.76077")   # Porto Velho padrão
CITY_LON     = os.getenv("CITY_LON", "-63.89993")
FETCH_INTERVAL = int(os.getenv("FETCH_INTERVAL", "30"))  # segundos

OPEN_METEO_URL = (
    f"https://api.open-meteo.com/v1/forecast?"
    f"latitude={CITY_LAT}&longitude={CITY_LON}&current_weather=true"
)

running = True


def handle_exit(signum, frame):
    global running
    print("🛑 Signal received, stopping collector...")
    running = False


# graceful shutdown signals
signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)


def connect_rabbit():
    """Tentativa de conexão com retry infinito."""
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            print("🐇 Conectado ao RabbitMQ com sucesso!")
            return connection, channel
        except Exception as e:
            print(f"❌ Falha ao conectar ao RabbitMQ: {e}")
            print("🔁 Tentando novamente em 5 segundos...")
            time.sleep(5)


def fetch_weather():
    """Obtém dados da API Open-Meteo."""
    try:
        response = requests.get(OPEN_METEO_URL, timeout=10)
        response.raise_for_status()
        data = response.json()

        if "current_weather" not in data:
            raise ValueError("current_weather ausente na resposta.")

        weather = {
            "temperature": data["current_weather"].get("temperature"),
            "windspeed": data["current_weather"].get("windspeed"),
            "winddirection": data["current_weather"].get("winddirection"),
            "time": data["current_weather"].get("time"),
            "latitude": CITY_LAT,
            "longitude": CITY_LON,
        }

        return weather

    except Exception as e:
        print(f"⚠️ Erro ao buscar clima: {e}")
        return None


def publish(channel, body: dict):
    """Envia JSON para a fila."""
    try:
        channel.basic_publish(
            exchange="",
            routing_key=QUEUE_NAME,
            body=json.dumps(body),
            properties=pika.BasicProperties(
                delivery_mode=2  # mensagem persistente
            ),
        )
        print(f"📤 Enviado para a fila: {body}")
        return True
    except Exception as e:
        print(f"❌ Erro ao publicar mensagem: {e}")
        return False


def main():
    connection, channel = connect_rabbit()

    while running:
        weather = fetch_weather()

        if weather:
            ok = publish(channel, weather)
            if not ok:
                # Tenta reconectar caso o canal tenha quebrado
                print("🔄 Recriando conexão com RabbitMQ...")
                connection.close()
                connection, channel = connect_rabbit()

        time.sleep(FETCH_INTERVAL)

    print("⏹ Finalizando collector...")
    try:
        connection.close()
    except:
        pass


if __name__ == "__main__":
    print("🌦️ Iniciando Collector Python...")
    main()
