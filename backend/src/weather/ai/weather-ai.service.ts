import { Injectable } from '@nestjs/common'

export type WeatherTrend = 'up' | 'down' | 'stable'

export interface WeatherAISummary {
  title: string
  summary: string
  trendExplanation: string
  forecast: string
  generatedAt: Date
}

@Injectable()
export class WeatherAIService {
  generate({
    city,
    current,
    avg,
    max,
    min,
    trend,
  }: {
    city: string
    current: number
    avg: number
    max: number
    min: number
    trend: WeatherTrend
  }): WeatherAISummary {
    let trendText = 'estável'

    if (trend === 'up') trendText = 'em elevação'
    else if (trend === 'down') trendText = 'em queda'

    let comfort = 'agradável'
    if (current >= 35) comfort = 'muito quente'
    else if (current >= 30) comfort = 'quente'
    else if (current <= 10) comfort = 'frio'

    const forecast =
      trend === 'up'
        ? 'A tendência indica aumento gradual da temperatura nas próximas horas.'
        : trend === 'down'
        ? 'A tendência indica queda gradual da temperatura.'
        : 'A temperatura deve se manter estável no curto prazo.'

    return {
      title: `Resumo climático — ${city}`,
      summary: `No momento, a temperatura está em ${current}°C, considerada ${comfort}. A média recente é de ${avg.toFixed(
        1,
      )}°C, com mínima de ${min}°C e máxima de ${max}°C.`,
      trendExplanation: `Observa-se uma tendência ${trendText} da temperatura ao longo das últimas medições.`,
      forecast,
      generatedAt: new Date(),
    }
  }
}
