import { Injectable, Logger } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Injectable()
export class WeatherConsumer {
  private readonly logger = new Logger(WeatherConsumer.name);

  constructor(private readonly weatherService: WeatherService) {}

  async handleMessage(payload: any) {
    try {
      await this.weatherService.createFromWorker(payload);
      this.logger.log('Weather log salvo com sucesso');
    } catch (err) {
      this.logger.error('Erro ao salvar weather log', err);
      throw err;
    }
  }
}
