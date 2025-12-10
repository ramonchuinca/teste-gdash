import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(): { message: string } {
    return { message: 'Acesso autorizado com JWT!' };
  }
}
