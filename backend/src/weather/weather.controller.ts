import { 
  Controller, 
  Get, 
  Query, 
  BadRequestException,
  Patch,
  Param,
  Body,
  Res
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Response } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  async getCurrent(
    @Query('city') city: string,

    // parâmetros longos
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,

    // parâmetros curtos
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    const finalLat = Number(latitude ?? lat);
    const finalLon = Number(longitude ?? lon);

    if (!city) {
      throw new BadRequestException('O campo "city" é obrigatório.');
    }

    if (isNaN(finalLat) || isNaN(finalLon)) {
      throw new BadRequestException(
        'Latitude e longitude precisam ser números válidos.'
      );
    }

    return await this.weatherService.getCurrentWeather(
      city,
      finalLat,
      finalLon,
    );
  }

  // ✔ Já existia — apenas mantido e corrigido findAll() no Service
  @Get('all')
  async getAll() {
    return await this.weatherService.findAll();
  }
}
