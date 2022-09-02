import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BookmarkDto {
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsString()
  link: string;
}
