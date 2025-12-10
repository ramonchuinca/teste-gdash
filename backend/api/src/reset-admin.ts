import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; // deve estar em backend/api/src/app.module.ts
import { UsersService } from './users/users.service'; // relativo à pasta src, se estiver em src/users
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  // Cria um contexto de aplicação NestJS (sem iniciar servidor HTTP)
  const app = await NestFactory.createApplicationContext(AppModule);

  // Obtém a instância do UsersService
  const usersService = app.get(UsersService);

  const email = 'admin@admin.com';

  // Verifica se o admin já existe
  const existing = await usersService.findByEmail(email);

  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10); // hash da senha
    const admin = await usersService.create({
      name: 'Admin',
      email,
      password: hashed,
      roles: ['admin'], // roles deve estar definido no seu schema
    });
    console.log('Admin criado:', admin);
  } else {
    console.log('Admin já existe:', existing);
  }

  // Fecha o contexto do NestJS
  await app.close();
}

// Executa o script
bootstrap().catch(err => {
  console.error('Erro ao criar admin:', err);
});
