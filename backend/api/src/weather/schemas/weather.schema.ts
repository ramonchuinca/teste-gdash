import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Weather {
  @Prop() temperature: number;
  @Prop() humidity: number;
  @Prop() windSpeed: number;
  @Prop() condition: string;
  @Prop() city: string;

  @Prop() createdAt?: Date;
  @Prop() updatedAt?: Date;
}


export const WeatherSchema = SchemaFactory.createForClass(Weather);
