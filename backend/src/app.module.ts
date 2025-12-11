// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BootstrapService } from './bootstrap/bootstrap.service';

@Module({
  imports: [
    // Conexão com MongoDB
    MongooseModule.forRoot('mongodb://clima-mongo:27017/clima'),

    // Módulos da aplicação
    WeatherModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    // Serviço responsável por criar admin no bootstrap
    BootstrapService,
  ],
})
export class AppModule {}
