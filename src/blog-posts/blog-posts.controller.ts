import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '@/auth/guards/public.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ParseIntPipe } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ActiveUser } from '@/auth/guards/active-user.guard';

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
  findAllPublished() {
    return this.blogPostsService.findAllPublished();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.blogPostsService.findOne(+id);
  }

  @Get('published/:id')
  findOnePublished(
    @Param('id') id: string,
    @ActiveUser('sub') userId?: number,
  ) {
    return this.blogPostsService.findOnePublished(+id, userId);
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

  @Post(':id/like')
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('sub') userId: number,
  ) {
    return this.blogPostsService.toggleLike(id, userId);
  }

  @Post(':id/comments')
  createComment(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('sub') userId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.blogPostsService.createComment(id, userId, createCommentDto);
  }

  @Post('comments/:id/like')
  toggleCommentLike(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('sub') userId: number,
  ) {
    return this.blogPostsService.toggleCommentLike(id, userId);
  }

  @Get(':id/comments')
  getComments(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('sub') userId: number,
  ) {
    return this.blogPostsService.getComments(id, userId);
  }

  @Patch('comments/:id')
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('sub') userId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.blogPostsService.updateComment(id, userId, updateCommentDto);
  }

  @Delete('comments/:id')
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('sub') userId: number,
  ) {
    return this.blogPostsService.deleteComment(id, userId);
  }
}
