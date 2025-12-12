import { 
  Controller, 
  Get, 
  Post,
  Query, 
  BadRequestException,
  Body,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  /**
   * POST /weather
   * Usado pelo Worker Go para inserir dados no Mongo
   */
  @Post()
  async createWeather(@Body() data: CreateWeatherDto) {
    return this.weatherService.create(data);
  }

  /**
   * GET /weather/current
   * Consulta API externa Open-Meteo
   */
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
        'Latitude e longitude precisam ser números válidos.',
      );
    }

    return await this.weatherService.getCurrentWeather(
      city,
      finalLat,
      finalLon,
    );
  }

  /**
   * GET /weather/all
   * Retorna todos os registros do MongoDB
   */
  @Get('all')
  async getAll() {
    return this.weatherService.findAll();
  }
}
