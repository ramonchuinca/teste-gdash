import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Login */
  @Post('login')
  async login(
    @Body() body: { email: string; password: string }, // ⚡ mudou de username para email
  ): Promise<{ access_token: string; user: any }> {
    console.log(body)
    const { email, password } = body;

    // Validar usuário
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Retornar token JWT + dados do usuário
    return this.authService.login(user);
  }
}
