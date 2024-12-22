import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '@/auth/guards/public.guard';

@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Post()
  @Roles('admin')
  create(@Body() createBlogPostDto: CreateBlogPostDto) {
    return this.blogPostsService.create(createBlogPostDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.blogPostsService.findAll();
  }

  @Get('published')
  @Public()
  findAllPublished() {
    return this.blogPostsService.findAllPublished();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.blogPostsService.findOne(+id);
  }

  @Get('published/:id')
  @Public()
  findOnePublished(@Param('id') id: string) {
    return this.blogPostsService.findOnePublished(+id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
  ) {
    return this.blogPostsService.update(+id, updateBlogPostDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.blogPostsService.remove(+id);
  }
}
