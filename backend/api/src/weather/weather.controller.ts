import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  /** Rota protegida para teste JWT */
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected() {
    return { message: 'Acesso autorizado com JWT!' };
  }

  /** Outras rotas públicas ou protegidas podem ser adicionadas aqui */
}
