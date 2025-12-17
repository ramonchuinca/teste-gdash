import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Weather, WeatherDocument } from './schemas/weather.schema'
import { WeatherInsightsService } from './insights/weather-insights.service'
import { WeatherAIService } from './ai/weather-ai.service'

@Injectable()
export class WeatherDashboardService {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
    private readonly insightsService: WeatherInsightsService,
    private readonly aiService: WeatherAIService,
  ) {}

  async getDashboard(city = 'Porto Velho') {
    const logs = await this.weatherModel
      .find({ city })
      .sort({ collectedAt: -1 })
      .limit(50)
      .lean()

    const baseResponse = {
      city,
      period: 'last_24h',
      updatedAt: new Date(),
      cards: null,
      chart: { labels: [], data: [] },
      table: [],
      insights: [],
      ai: null,
    }

    if (!logs.length) return baseResponse

    const temps = logs
      .map(l => l.temperature)
      .filter((t): t is number => typeof t === 'number')

    if (!temps.length) return baseResponse

    const current = temps[0]
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length
    const max = Math.max(...temps)
    const min = Math.min(...temps)

    const oldest = temps[temps.length - 1]
    const trend =
      current > oldest ? 'up' :
      current < oldest ? 'down' :
      'stable'

    const orderedLogs = [...logs].reverse()

    return {
      ...baseResponse,

      cards: {
        current,
        avg: Number(avg.toFixed(1)),
        max,
        min,
        trend,
      },

      chart: {
        labels: orderedLogs.map(l =>
          l.collectedAt
            ? new Date(l.collectedAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '--',
        ),
        data: orderedLogs.map(l => l.temperature ?? 0),
      },

      table: logs.slice(0, 10).map(l => ({
        time: l.collectedAt ?? new Date(),
        temperature: l.temperature ?? 0,
        windSpeed: l.windSpeed ?? 0,
        humidity: l.humidity ?? 0,
      })),

      insights:
        this.insightsService.generate({
          current,
          avg,
          max,
          min,
          trend,
        }) ?? [],

      /* 🧠 IA */
      ai: this.aiService.generate({
        city,
        current,
        avg,
        max,
        min,
        trend,
      }),
    }
  }
}
