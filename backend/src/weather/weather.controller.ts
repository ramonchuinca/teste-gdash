import {
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
  Body,
} from '@nestjs/common';

import { WeatherService } from './weather.service';
import { CreateWeatherFromWorkerDto } from './dto/create-weather.dto';
import { Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  /**
   * POST /weather/logs
   * Usado pelo Worker Go
   */
  @Post('logs')
  async createFromWorker(
    @Body() data: CreateWeatherFromWorkerDto,
  ) {
    if (
      data.temperature === undefined ||
      data.humidity === undefined ||
      !data.city
    ) {
      throw new BadRequestException('Payload inválido enviado pelo worker');
    }

    return this.weatherService.createFromWorker(data);
  }

  /**
   * GET /weather/current
   */
  @Get('current')
  async getCurrent(
    @Query('city') city: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
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
        'Latitude e longitude precisam ser números válidos.',
      );
    }

    return this.weatherService.getCurrentWeather(
      city,
      finalLat,
      finalLon,
    );
  }

  /**
   * GET /weather/all
   */
  @Get('all')
  async getAll() {
    return this.weatherService.findAll();
  }
}
