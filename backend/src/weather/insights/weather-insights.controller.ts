// backend/src/weather/insights/weather-insights.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { WeatherInsightsService } from './weather-insights.service';

@Controller('weather/insights')
export class WeatherInsightsController {
  constructor(
    private readonly insightsService: WeatherInsightsService,
  ) {}

  @Get()
  async getInsights(
    @Query('limit') limit = '24',
  ) {
    return this.insightsService.getInsights(Number(limit));
  }
}
