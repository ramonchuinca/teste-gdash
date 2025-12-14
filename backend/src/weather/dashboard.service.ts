import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';

@Injectable()
export class WeatherDashboardService {
  constructor(
    @InjectModel(Weather.name)
    private weatherModel: Model<WeatherDocument>,
  ) {}

  async getDashboard(city: string) {
   const logs = await this.weatherModel
  .find({ city })
  .sort({ createdAt: -1 })
  .limit(50)
  .lean<{ 
    temperature: number;
    windSpeed: number;
    humidity: number;
    createdAt: Date;
  }[]>();


    if (!logs.length) {
      return null;
    }

    const temps = logs.map((l) => l.temperature);
    const current = temps[0];

    const avg =
      temps.reduce((a, b) => a + b, 0) / temps.length;

    const max = Math.max(...temps);
    const min = Math.min(...temps);

    // 📈 tendência simples
    const trend =
      temps[0] > temps[temps.length - 1] ? 'up' : 'down';

    return {
      city,
      period: 'last_24h',
      updatedAt: new Date(),

      cards: {
        current,
        avg: Number(avg.toFixed(1)),
        max,
        min,
        trend,
      },

      chart: {
        labels: logs
          .slice()
          .reverse()
          .map((l) =>
            new Date(l.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          ),
        data: logs
          .slice()
          .reverse()
          .map((l) => l.temperature),
      },

      table: logs.slice(0, 10).map((l) => ({
        time: l.createdAt,
        temperature: l.temperature,
        windSpeed: l.windSpeed,
        humidity: l.humidity,
      })),

      insights: this.buildInsights({
        avg,
        max,
        current,
        trend,
      }),
    };
  }

  private buildInsights({
    avg,
    max,
    current,
    trend,
  }: {
    avg: number;
    max: number;
    current: number;
    trend: string;
  }): string[] {
    const insights: string[] = [];

    if (trend === 'up') {
      insights.push('📈 Temperatura em tendência de alta');
    }

    if (current > avg + 2) {
      insights.push('🔥 Temperatura atual acima da média diária');
    }

    if (max > 35) {
      insights.push('⚠️ Pico de calor elevado detectado');
    }

    return insights;
  }
}
