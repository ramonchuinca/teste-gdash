export declare class Weather {
    temperature: number;
    humidity: number;
    wind_speed: number;
    city: string;
}
export declare const WeatherSchema: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    [x: string]: any;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    [x: string]: any;
}>> & import("mongoose").FlatRecord<{
    [x: string]: any;
}> & Required<{
    _id: unknown;
}>>;
