import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBookmarkDto {
  @IsOptional()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsString()
  link: string;
}
