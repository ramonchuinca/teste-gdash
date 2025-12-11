import { Controller, Post, Body, Get } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('add')  // -> POST /weather/add
  async addWeather(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get('all')   // -> GET /weather/all
  async getAll() {
    return this.weatherService.findAll();
  }
}
