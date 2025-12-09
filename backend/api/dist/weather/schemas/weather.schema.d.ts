export declare class Weather {
    temperature: number;
    humidity: number;
    wind_speed: number;
    city: string;
}
export declare const WeatherSchema: import("mongoose").Schema<Weather, import("mongoose").Model<Weather, any, any, any, import("mongoose").Document<unknown, any, Weather> & Weather & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Weather, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Weather>> & import("mongoose").FlatRecord<Weather> & {
    _id: import("mongoose").Types.ObjectId;
}>;
