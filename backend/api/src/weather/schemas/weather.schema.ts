import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true
})
export class Weather {
  @Prop() temperature: number;
  @Prop() humidity: number;
  @Prop() wind_speed: number;
  @Prop() city: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
