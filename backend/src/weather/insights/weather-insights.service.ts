import { Injectable } from '@nestjs/common'

export type InsightType = 'info' | 'warning' | 'danger'

export interface WeatherInsight {
  type: InsightType
  code: string
  message: string
}

@Injectable()
export class WeatherInsightsService {
  generate({
    current,
    avg,
    max,
    min,
    trend,
  }: {
    current: number
    avg: number
    max: number
    min: number
    trend: 'up' | 'down' | 'stable'
  }): WeatherInsight[] {
    const insights: WeatherInsight[] = []

    /* =========================
       📈 Tendência
    ========================= */
    if (trend === 'up') {
      insights.push({
        type: 'info',
        code: 'TREND_UP',
        message: 'Temperatura em tendência de alta.',
      })
    } else if (trend === 'down') {
      insights.push({
        type: 'info',
        code: 'TREND_DOWN',
        message: 'Temperatura em tendência de queda.',
      })
    }

    /* =========================
       🔥 / ❄️ Desvio da média
    ========================= */
    if (current >= avg + 2) {
      insights.push({
        type: 'warning',
        code: 'ABOVE_AVERAGE',
        message: 'Temperatura atual significativamente acima da média.',
      })
    } else if (current <= avg - 2) {
      insights.push({
        type: 'warning',
        code: 'BELOW_AVERAGE',
        message: 'Temperatura atual abaixo da média diária.',
      })
    }

    /* =========================
       🚨 Extremos
    ========================= */
    if (max >= 35) {
      insights.push({
        type: 'danger',
        code: 'EXTREME_HEAT',
        message: 'Pico de calor elevado detectado. Atenção!',
      })
    }

    if (min <= 10) {
      insights.push({
        type: 'danger',
        code: 'EXTREME_COLD',
        message: 'Temperatura mínima muito baixa detectada.',
      })
    }

    return insights
  }
}
