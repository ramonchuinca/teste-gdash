export class CreateWeatherFromWorkerDto {
  temperature!: number;
  humidity!: number;
  city!: string;

  windSpeed?: number;
  condition?: string;

  // controle de origem e tempo
  collectedAt?: string;
  source?: string;
}
