import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { Weather, WeatherSchema } from './schemas/weather.schema';

// Dashboard
import { DashboardController } from './dashboard.controller';
import { WeatherDashboardService } from './dashboard.service';

// Insights
import { WeatherInsightsService } from './insights/weather-insights.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Weather.name, schema: WeatherSchema },
    ]),
  ],
  providers: [
    WeatherService,
    WeatherInsightsService,
    WeatherDashboardService, // ✅ ADICIONADO
  ],
  controllers: [
    WeatherController,
    DashboardController,
    
  ],
})
export class WeatherModule {}
