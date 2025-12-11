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
var WeatherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const weather_schema_1 = require("./schemas/weather.schema");
const axios_1 = __importDefault(require("axios"));
let WeatherService = WeatherService_1 = class WeatherService {
    constructor(model) {
        this.model = model;
        this.logger = new common_1.Logger(WeatherService_1.name);
    }
    async create(data) {
        try {
            return await this.model.create(data);
        }
        catch (error) {
            this.logger.error('Erro ao criar registro', error.message);
            throw new Error('Failed to create weather record');
        }
    }
    async findAll(limit = 100, skip = 0) {
        return await this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    }
    async getCurrent(city, latitude, longitude) {
        try {
            const response = await axios_1.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = response.data?.current_weather;
            if (!data)
                return null;
            return {
                temperature: data.temperature ?? 0,
                windSpeed: data.windspeed ?? 0,
                humidity: data.humidity ?? 0,
                condition: data.weathercode ?? '',
                city,
                createdAt: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Erro ao buscar clima atual para ${city}`, error.message);
            return null;
        }
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = WeatherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(weather_schema_1.Weather.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WeatherService);
