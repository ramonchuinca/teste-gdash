"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const weather_schema_1 = require("./schemas/weather.schema");
const axios_1 = __importDefault(require("axios"));
let WeatherService = class WeatherService {
    constructor(weatherModel) {
        this.weatherModel = weatherModel;
    }
    async create(data) {
        return this.weatherModel.create(data);
    }
    // ✔ Corrigido — valores padrão para funcionar com GET /weather/all
    async findAll(limit = 50, skip = 0) {
        return this.weatherModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .exec();
    }
    async getCurrentWeather(city, latitude, longitude) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
            const response = await axios_1.default.get(url, {
                timeout: 20000,
                family: 4, // força IPv4 no Docker
                validateStatus: () => true,
            });
            if (!response.data?.current_weather) {
                console.error("Resposta inesperada:", response.data);
                throw new Error("A API não retornou current_weather.");
            }
            const weather = response.data.current_weather;
            const saved = await this.weatherModel.create({
                city,
                temperature: weather.temperature,
                windSpeed: weather.windspeed,
                condition: weather.weathercode,
                timestamp: weather.time,
                humidity: 50, // mock
            });
            return {
                message: "Clima atual coletado com sucesso!",
                data: saved
            };
        }
        catch (error) {
            console.error("❌ ERRO AO CHAMAR OPEN-METEO");
            console.error(error);
            throw new Error("Falha ao consultar a API de clima (Open-Meteo).");
        }
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(weather_schema_1.Weather.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WeatherService);
