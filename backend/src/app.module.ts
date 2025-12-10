import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WeatherModule } from './weather/weather.module';
import { BootstrapService } from './bootstrap/bootstrap.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI, { autoCreate: true }),
    UsersModule,
    AuthModule,
    WeatherModule,
  ],
  providers: [BootstrapService],
})
export class AppModule {}
