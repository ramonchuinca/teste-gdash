import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';

import { WeatherModule } from './weather/weather.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BootstrapService } from './bootstrap/bootstrap.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://clima-mongo:27017/clima'),

    CacheModule.register({
      ttl: 30,
      isGlobal: true,
    }),

    WeatherModule,
    AuthModule,
    UsersModule,
  ],
  providers: [BootstrapService],
})
export class AppModule {}
