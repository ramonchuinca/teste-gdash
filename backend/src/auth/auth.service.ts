import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    console.log('funciona',user)
    if (!user) return null;

    // ⚡ comparar senha primeiro
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // ⚡ remover senha só depois
    const userObj = (user as UserDocument).toObject();
    delete userObj.password;
    return userObj;
  }

  async login(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    };
    return { access_token: this.jwt.sign(payload), user: payload };
  }

  async register(data: { name: string; email: string; password: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const created = await this.users.create({
      ...data,
      password: hashed,
      roles: ['user'],
    });

    const userObj = (created as UserDocument).toObject();
    delete userObj.password;
    return userObj;
  }
}
