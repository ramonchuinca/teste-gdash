// backend/src/weather/schemas/weather.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema({ timestamps: true })
export class Weather {
  @Prop({ required: true })
  temperature!: number; // O "!" indica que sempre terá valor

  @Prop({ required: true })
  humidity!: number;

  @Prop({ required: true })
  city!: string;

  @Prop()
  windSpeed?: number;

  @Prop()
  condition?: string;

  @Prop()
  createdAt?: Date; // Mongoose vai preencher automaticamente com timestamps
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
