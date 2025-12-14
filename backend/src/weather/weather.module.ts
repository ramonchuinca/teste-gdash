import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { Weather, WeatherSchema } from './schemas/weather.schema';

// Dashboard
import { DashboardController } from '../weather/dashboard.controller';

// Insights
import { WeatherInsightsService } from './insights/weather-insights.service';
import { WeatherInsightsController } from './insights/weather-insights.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Weather.name, schema: WeatherSchema },
    ]),
  ],
  providers: [
    WeatherService,
    WeatherInsightsService,
  ],
  controllers: [
    WeatherController,
    DashboardController,
    WeatherInsightsController,
  ],
})
export class WeatherModule {}
