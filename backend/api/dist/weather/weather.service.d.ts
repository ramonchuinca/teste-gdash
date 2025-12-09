export declare class WeatherService {
    sendWeatherToQueue(): Promise<{
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
