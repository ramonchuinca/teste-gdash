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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const weather_schema_1 = require("./schemas/weather.schema");
let WeatherService = class WeatherService {
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return this.model.create(data);
    }
    async findAll(limit = 100, skip = 0) {
        return this.model
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
    async exportCSV() {
        var _a, _b, _c, _d;
        const rows = await this.model.find().lean().exec();
        const header = [
            'createdAt',
            'temperature',
            'humidity',
            'windSpeed',
            'condition',
            'city',
        ];
        const csv = [header.join(',')];
        for (const r of rows) {
            csv.push([
                (_a = r.createdAt) !== null && _a !== void 0 ? _a : '', // timestamps
                (_b = r.temperature) !== null && _b !== void 0 ? _b : '',
                (_c = r.humidity) !== null && _c !== void 0 ? _c : '',
                (_d = r.windSpeed) !== null && _d !== void 0 ? _d : '', // nome correto do schema
                `"${r.condition || ''}"`,
                `"${r.city || ''}"`,
            ].join(','));
        }
        return csv.join('\n');
    }
    async insights() {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const rows = await this.model
            .find({ createdAt: { $gte: since } })
            .lean()
            .exec();
        if (!rows.length) {
            return { message: 'No data' };
        }
        const avgTemp = rows.reduce((s, r) => s + (r.temperature || 0), 0) / rows.length;
        const avgHum = rows.reduce((s, r) => s + (r.humidity || 0), 0) / rows.length;
        const trend = rows[0].temperature < rows[rows.length - 1].temperature
            ? 'rising'
            : 'falling';
        return { avgTemp, avgHum, count: rows.length, trend };
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(weather_schema_1.Weather.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WeatherService);
