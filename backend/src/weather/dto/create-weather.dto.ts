// backend/src/weather/dto/create-weather.dto.ts
export class CreateWeatherDto {
  temperature!: number;
  windSpeed?: number;
  humidity!: number;
  city!: string;
  condition?: string;
}
