import { Controller, Get } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('send')
  async sendWeather() {
    return this.weatherService.sendWeatherToQueue();
  }
}
