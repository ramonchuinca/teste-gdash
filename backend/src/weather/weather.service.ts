import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather } from './schemas/weather.schema';
import axios from 'axios';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(@InjectModel(Weather.name) private model: Model<Weather>) {}

  async create(data: CreateWeatherDto): Promise<Weather> {
    try {
      return await this.model.create(data);
    } catch (error: any) {
      this.logger.error('Erro ao criar registro', error.message);
      throw new Error('Failed to create weather record');
    }
  }

  async findAll(limit = 100, skip = 0) {
    return await this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async getCurrent(city: string, latitude: number, longitude: number) {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = response.data?.current_weather;
      if (!data) return null;
      return {
        temperature: data.temperature ?? 0,
        windSpeed: data.windspeed ?? 0,
        humidity: data.humidity ?? 0,
        condition: data.weathercode ?? '',
        city,
        createdAt: new Date(),
      };
    } catch (error: any) {
      this.logger.error(`Erro ao buscar clima atual para ${city}`, error.message);
      return null;
    }
  }
}
