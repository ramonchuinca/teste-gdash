import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Login */
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
  ): Promise<{ access_token: string }> {
    // Retorna apenas o token JWT
    return this.authService.login(body);
  }
}
