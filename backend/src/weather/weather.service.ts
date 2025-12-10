import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather } from './schemas/weather.schema';
import axios from 'axios';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(@InjectModel(Weather.name) private model: Model<Weather>) {}

  async create(data: Partial<Weather>): Promise<Weather> {
    try {
      return await this.model.create(data);
    } catch (error: unknown) {
      this.logger.error(
        'Erro ao criar registro',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error('Failed to create weather record');
    }
  }

  async findAll(limit = 100, skip = 0) {
    try {
      return await this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    } catch (error: unknown) {
      this.logger.error(
        'Erro ao buscar registros',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error('Failed to fetch weather records');
    }
  }

  async exportCSV() {
    try {
      const rows = await this.model.find().lean().exec();
      const header = ['createdAt', 'temperature', 'humidity', 'windSpeed', 'condition', 'city'];
      const csv = [header.join(',')];

      for (const r of rows) {
        csv.push([
          r.createdAt ?? '',
          r.temperature ?? '',
          r.humidity ?? '',
          r.windSpeed ?? '',
          `"${r.condition || ''}"`,
          `"${r.city || ''}"`,
        ].join(','));
      }

      return csv.join('\n');
    } catch (error: unknown) {
      this.logger.error(
        'Erro ao exportar CSV',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error('Failed to export CSV');
    }
  }

  async insights() {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const rows = await this.model.find({ createdAt: { $gte: since } }).lean().exec();

      if (!rows.length) return { message: 'No data' };

      const avgTemp = rows.reduce((s, r) => s + (r.temperature || 0), 0) / rows.length;
      const avgHum = rows.reduce((s, r) => s + (r.humidity || 0), 0) / rows.length;
      const trend =
        rows[0].temperature < rows[rows.length - 1].temperature ? 'rising' : 'falling';

      return { avgTemp, avgHum, count: rows.length, trend };
    } catch (error: unknown) {
      this.logger.error(
        'Erro ao gerar insights',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error('Failed to generate insights');
    }
  }

  async getCurrent(city: string, latitude: number, longitude: number) {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );

      const data = response.data?.current_weather;
      if (!data) return null;

      return {
        temperature: data.temperature ?? null,
        windSpeed: data.windspeed ?? null,
        humidity: data.humidity ?? null,
        condition: data.weathercode ?? null,
        city,
        createdAt: new Date(),
      };
    } catch (error: unknown) {
      this.logger.error(
        `Erro ao buscar clima atual para ${city}`,
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }
}
