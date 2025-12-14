import { Controller, Get, Query } from '@nestjs/common';
import { WeatherDashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: WeatherDashboardService,
  ) {}

  @Get()
  async getDashboard(
    @Query('city') city = 'Porto Velho',
  ) {
    return this.dashboardService.getDashboard(city);
  }
}
