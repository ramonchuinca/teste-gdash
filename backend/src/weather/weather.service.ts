import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

import { Weather, WeatherDocument } from './schemas/weather.schema';
import { CreateWeatherFromWorkerDto } from './dto/create-weather.dto';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
  ) {}

  /**
   * Usado pelo Worker Go
   */
  async createFromWorker(
    data: CreateWeatherFromWorkerDto,
  ): Promise<Weather> {
    return this.weatherModel.create({
      ...data,
      collectedAt: data.collectedAt
        ? new Date(data.collectedAt)
        : new Date(),
      source: data.source ?? 'worker-go',
    });
  }

  /**
   * GET /weather/all
   */
  async findAll(limit = 50, skip = 0): Promise<Weather[]> {
    return this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * GET /weather/current
   * Consulta Open-Meteo e salva no Mongo
   */
  async getCurrentWeather(
    city: string,
    latitude: number,
    longitude: number,
  ) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    const response = await axios.get(url, {
      timeout: 20000,
      family: 4,
      validateStatus: () => true,
    });

    if (!response.data?.current_weather) {
      throw new Error('A API não retornou current_weather.');
    }

    const weather = response.data.current_weather;

    const saved = await this.weatherModel.create({
      city,
      temperature: weather.temperature,
      windSpeed: weather.windspeed,
      condition: String(weather.weathercode),
      humidity: 50, // mock
      collectedAt: new Date(weather.time),
      source: 'open-meteo',
    });

    return {
      message: 'Clima atual coletado com sucesso!',
      data: saved,
    };
  }

  /**
   * GET /dashboard
   * Dados agregados para o frontend
   */
  async getDashboard() {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const logs = await this.weatherModel
      .find({ collectedAt: { $gte: since } })
      .sort({ collectedAt: 1 })
      .exec();

    if (!logs.length) {
      return {
        cards: null,
        chart: [],
        table: [],
        insights: ['Sem dados climáticos suficientes'],
      };
    }

    const temps = logs.map(l => l.temperature);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    const trend =
      temps[temps.length - 1] > temps[0] ? 'up' : 'down';

    return {
      cards: {
        avgTemp: Number(avgTemp.toFixed(1)),
        maxTemp,
        minTemp,
        trend,
      },
      chart: logs.map(l => ({
        time: l.collectedAt,
        temperature: l.temperature,
      })),
      table: logs.slice(-20).reverse(),
      insights: [
        avgTemp > 30
          ? 'Temperatura média elevada nas últimas 24h'
          : 'Temperatura dentro da média',
        trend === 'up'
          ? 'Tendência de aquecimento'
          : 'Tendência de resfriamento',
      ],
    };
  }
}
