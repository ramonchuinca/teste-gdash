import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as amqp from 'amqplib';

@Injectable()
export class WeatherService {
  async sendWeatherToQueue() {
    const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
    const QUEUE_NAME = "weather_queue";

    try {
      const { data } = await axios.get(WEATHER_API, {
        params: {
          latitude: -8.7612,
          longitude: -63.9039,
          current_weather: true,
        },
      });

      const payload = {
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        timestamp: new Date(),
      };

      const conn = await amqp.connect("amqp://rabbitmq:5672");
      const channel = await conn.createChannel();
      await channel.assertQueue(QUEUE_NAME);

      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(payload)),
      );

      console.log("📤 Enviado para a fila:", payload);

      return {
        message: "Clima enviado com sucesso",
        payload,
      };
    } catch (e) {
      console.log("❌ Erro ao enviar clima:", e);
      return { error: "Erro ao enviar clima" };
    }
  }
}
