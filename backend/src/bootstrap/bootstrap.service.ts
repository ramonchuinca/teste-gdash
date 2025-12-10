import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const adminEmail = 'admin@example.com';
    const adminPassword = '123456';

    const exists = await this.usersService.findByEmail(adminEmail);

    if (!exists) {
      this.logger.log('Creating default admin user...');

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await this.usersService.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        roles: ['admin'],
      });

      this.logger.log('Default admin created successfully!');
    } else {
      this.logger.log('Admin already exists.');
    }
  }
}
