import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatedUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsOptional()
  @IsEmail()
  email: string;
}
