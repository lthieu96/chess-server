import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsOptional()
  @IsEnum(['draft', 'published'], {
    message: 'Status must be either draft or published',
  })
  status?: 'draft' | 'published' = 'draft';
}
