import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
