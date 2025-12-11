import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import axios from 'axios';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
  ) {}

  async create(data: any): Promise<Weather> {
    return this.weatherModel.create(data);
  }

  // ✔ Corrigido — valores padrão para funcionar com GET /weather/all
  async findAll(limit = 50, skip = 0): Promise<Weather[]> {
    return this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getCurrentWeather(city: string, latitude: number, longitude: number) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

      const response = await axios.get(url, {
        timeout: 20000,
        family: 4, // força IPv4 no Docker
        validateStatus: () => true,
      });

      if (!response.data?.current_weather) {
        console.error("Resposta inesperada:", response.data);
        throw new Error("A API não retornou current_weather.");
      }

      const weather = response.data.current_weather;

      const saved = await this.weatherModel.create({
        city,
        temperature: weather.temperature,
        windSpeed: weather.windspeed,
        condition: weather.weathercode,
        timestamp: weather.time,
        humidity: 50, // mock
      });

      return {
        message: "Clima atual coletado com sucesso!",
        data: saved
      };

    } catch (error) {
      console.error("❌ ERRO AO CHAMAR OPEN-METEO");
      console.error(error);
      throw new Error("Falha ao consultar a API de clima (Open-Meteo).");
    }
  }
}
