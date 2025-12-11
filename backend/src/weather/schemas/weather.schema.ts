import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Weather extends Document {
  @Prop({ required: true })
  temperature!: number;

  @Prop({ required: true })
  humidity!: number;

  @Prop({ required: true })
  windSpeed!: number;

  @Prop({ required: true })
  condition!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
