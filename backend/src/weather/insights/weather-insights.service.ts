// backend/src/weather/insights/weather-insights.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from '../schemas/weather.schema';

@Injectable()
export class WeatherInsightsService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
  ) {}

  async getInsights(limit = 24) {
    const data = await this.weatherModel
      .find()
      .sort({ collectedAt: -1 })
      .limit(limit)
      .exec();

    if (!data.length) {
      return { message: 'Sem dados suficientes para análise.' };
    }

    const temps = data.map(d => d.temperature);

    const avg =
      temps.reduce((a, b) => a + b, 0) / temps.length;

    const max = Math.max(...temps);
    const min = Math.min(...temps);

    const trend =
      temps[0] > temps[temps.length - 1]
        ? 'subindo'
        : temps[0] < temps[temps.length - 1]
        ? 'descendo'
        : 'estável';

    const summary = `Nos últimos ${temps.length} registros, a temperatura média foi de ${avg.toFixed(
      1,
    )}°C, com pico de ${max}°C e mínima de ${min}°C. A tendência está ${trend}.`;

    return {
      average: Number(avg.toFixed(1)),
      max,
      min,
      trend,
      lastCollectedAt: data[0].collectedAt,
      summary,
    };
  }
}
