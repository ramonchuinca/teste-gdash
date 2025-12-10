import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data) {
    console.log('USERSERVICE CREATE RECEIVED:', data);

    try {
      const created = new this.userModel(data);
      const saved = await created.save();
      console.log('USER SAVED:', saved);
      return saved;
    } catch (err) {
      console.error('ERROR SAVING USER:', err);
      throw err;
    }
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
