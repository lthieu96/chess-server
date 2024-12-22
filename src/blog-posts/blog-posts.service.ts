import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { blogPosts } from '../database/schema';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class BlogPostsService {
  constructor(private drizzle: DrizzleService) {}

  create(createBlogPostDto: CreateBlogPostDto) {
    return this.drizzle.db.insert(blogPosts).values(createBlogPostDto);
  }

  findAll() {
    return this.drizzle.db.select().from(blogPosts);
  }

  findAllPublished() {
    return this.drizzle.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'));
  }

  findOne(id: number) {
    return this.drizzle.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .then((results) => {
        const post = results[0];
        if (!post) {
          throw new NotFoundException(`Blog post #${id} not found`);
        }
        return post;
      });
  }

  findOnePublished(id: number) {
    return this.drizzle.db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.id, id), eq(blogPosts.status, 'published')))
      .then((results) => {
        const post = results[0];
        if (!post) {
          throw new NotFoundException(`Published blog post #${id} not found`);
        }
        return post;
      });
  }

  async update(id: number, updateBlogPostDto: UpdateBlogPostDto) {
    await this.drizzle.db
      .update(blogPosts)
      .set(updateBlogPostDto)
      .where(eq(blogPosts.id, id));
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.drizzle.db.delete(blogPosts).where(eq(blogPosts.id, id));
    return { id };
  }
}
