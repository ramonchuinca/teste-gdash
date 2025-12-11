// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsArray()
  roles?: string[];
}
