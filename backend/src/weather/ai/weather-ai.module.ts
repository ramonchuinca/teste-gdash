import { Module } from '@nestjs/common'
import { WeatherAIService } from './weather-ai.service'

@Module({
  providers: [WeatherAIService],
  exports: [WeatherAIService],
})
export class WeatherAIModule {}
