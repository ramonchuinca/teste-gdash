// backend/src/users/users.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /** Cria um usuário com senha hash */
  async create(data: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const createdUser = new this.userModel({ ...data, password: hashedPassword });
      return await createdUser.save();
    } catch (error: any) {
      this.logger.error('Erro ao criar usuário', error.message);
      throw new Error('Failed to create user');
    }
  }

  /** Lista usuários */
  async findAll(limit = 100, skip = 0): Promise<User[]> {
    return this.userModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  /** Busca usuário por email */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
