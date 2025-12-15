import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Weather, WeatherDocument } from './schemas/weather.schema'
import { WeatherInsightsService } from './insights/weather-insights.service'

@Injectable()
export class WeatherDashboardService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
    private readonly insightsService: WeatherInsightsService,
  ) {}

  async getDashboard(city = 'Porto Velho') {
    const logs = await this.weatherModel
      .find({ city })
      .sort({ collectedAt: -1 })
      .limit(50)
      .lean()

    if (!logs || logs.length === 0) {
      return {
        city,
        period: 'last_24h',
        updatedAt: new Date(),
        cards: null,
        chart: { labels: [], data: [] },
        table: [],
        insights: [],
      }
    }

    const temps = logs
      .map(l => l.temperature)
      .filter((t): t is number => typeof t === 'number')

    if (temps.length === 0) {
      return {
        city,
        period: 'last_24h',
        updatedAt: new Date(),
        cards: null,
        chart: { labels: [], data: [] },
        table: [],
        insights: [],
      }
    }

    const current = temps[0]
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length
    const max = Math.max(...temps)
    const min = Math.min(...temps)

    const trend =
      temps.length > 1
        ? temps[0] > temps[temps.length - 1]
          ? 'up'
          : temps[0] < temps[temps.length - 1]
          ? 'down'
          : 'stable'
        : 'stable'

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
          .map(l =>
            l.collectedAt
              ? new Date(l.collectedAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--',
          ),
        data: logs.slice().reverse().map(l => l.temperature ?? 0),
      },

      table: logs.slice(0, 10).map(l => ({
        time: l.collectedAt ?? new Date(),
        temperature: l.temperature ?? 0,
        windSpeed: l.windSpeed ?? 0,
        humidity: l.humidity ?? 0,
      })),

      insights: this.insightsService.generate({
        current,
        avg,
        max,
        min,
        trend,
      }),
    }
  }
}
