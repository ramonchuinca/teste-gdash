import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://clima-mongo:27017/clima'), // conexão com Mongo do docker
    WeatherModule,
  ],
})
export class AppModule {}
