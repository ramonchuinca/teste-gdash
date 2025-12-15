import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema({
  timestamps: false,
})
export class Weather {
  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  temperature!: number;

  @Prop()
  windSpeed!: number;

  @Prop()
  humidity!: number;

  @Prop({
    type: Date,
    required: true,
    default: () => new Date(),
  })
  collectedAt!: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
