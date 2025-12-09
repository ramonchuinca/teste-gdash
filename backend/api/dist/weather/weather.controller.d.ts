import { WeatherService } from './weather.service';
export declare class WeatherController {
    private readonly weatherService;
    constructor(weatherService: WeatherService);
    sendWeather(): Promise<{
        message: string;
        payload: {
            temperature: any;
            windspeed: any;
            timestamp: Date;
        };
        error?: undefined;
    } | {
        error: string;
        message?: undefined;
        payload?: undefined;
    }>;
}
