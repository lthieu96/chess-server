import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import {
  blogPosts,
  blogPostLikes,
  comments,
  commentLikes,
  users,
} from '../database/schema';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { eq, and, sql, desc } from 'drizzle-orm';

@Injectable()
export class BlogPostsService {
  constructor(private drizzle: DrizzleService) {}

  create(createBlogPostDto: CreateBlogPostDto) {
    return this.drizzle.db.insert(blogPosts).values(createBlogPostDto);
  }

  async findAll() {
    const posts = await this.drizzle.db
      .select({
        post: blogPosts,
        likesCount: sql<number>`count(${blogPostLikes.id})::int`,
        commentsCount: sql<number>`count(${comments.id})::int`,
      })
      .from(blogPosts)
      .leftJoin(blogPostLikes, eq(blogPosts.id, blogPostLikes.postId))
      .leftJoin(comments, eq(blogPosts.id, comments.postId))
      .groupBy(blogPosts.id)
      .orderBy(desc(blogPosts.createdAt));

    return posts;
  }

  async findAllPublished() {
    const posts = await this.drizzle.db
      .select({
        post: blogPosts,
        likesCount: sql<number>`count(${blogPostLikes.id})::int`,
        commentsCount: sql<number>`count(${comments.id})::int`,
      })
      .from(blogPosts)
      .leftJoin(blogPostLikes, eq(blogPosts.id, blogPostLikes.postId))
      .leftJoin(comments, eq(blogPosts.id, comments.postId))
      .where(eq(blogPosts.status, 'published'))
      .groupBy(blogPosts.id)
      .orderBy(desc(blogPosts.createdAt));

    return posts;
  }

  async findOne(id: number) {
    const posts = await this.drizzle.db
      .select({
        post: blogPosts,
        likesCount: sql<number>`count(${blogPostLikes.id})::int`,
        commentsCount: sql<number>`count(${comments.id})::int`,
      })
      .from(blogPosts)
      .leftJoin(blogPostLikes, eq(blogPosts.id, blogPostLikes.postId))
      .leftJoin(comments, eq(blogPosts.id, comments.postId))
      .where(eq(blogPosts.id, id))
      .groupBy(blogPosts.id);

    const post = posts[0];
    if (!post) {
      throw new NotFoundException(`Blog post #${id} not found`);
    }
    return post;
  }

  async findOnePublished(id: number) {
    const posts = await this.drizzle.db
      .select({
        post: blogPosts,
        likesCount: sql<number>`count(${blogPostLikes.id})::int`,
        commentsCount: sql<number>`count(${comments.id})::int`,
      })
      .from(blogPosts)
      .leftJoin(blogPostLikes, eq(blogPosts.id, blogPostLikes.postId))
      .leftJoin(comments, eq(blogPosts.id, comments.postId))
      .where(and(eq(blogPosts.id, id), eq(blogPosts.status, 'published')))
      .groupBy(blogPosts.id);

    const post = posts[0];
    if (!post) {
      throw new NotFoundException(`Published blog post #${id} not found`);
    }
    return post;
  }

  async update(id: number, updateBlogPostDto: UpdateBlogPostDto) {
    await this.findOne(id);
    await this.drizzle.db
      .update(blogPosts)
      .set(updateBlogPostDto)
      .where(eq(blogPosts.id, id));
    return { id };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.drizzle.db.delete(blogPosts).where(eq(blogPosts.id, id));
    return { id };
  }

  async toggleLike(postId: number, userId: number) {
    // Verify post exists and is published
    await this.findOnePublished(postId);

    const existingLike = await this.drizzle.db
      .select()
      .from(blogPostLikes)
      .where(
        and(eq(blogPostLikes.postId, postId), eq(blogPostLikes.userId, userId)),
      );

    if (existingLike.length > 0) {
      await this.drizzle.db
        .delete(blogPostLikes)
        .where(
          and(
            eq(blogPostLikes.postId, postId),
            eq(blogPostLikes.userId, userId),
          ),
        );
      return { liked: false };
    }

    await this.drizzle.db.insert(blogPostLikes).values({
      postId,
      userId,
    });
    return { liked: true };
  }

  async createComment(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ) {
    // Verify post exists and is published
    await this.findOnePublished(postId);

    if (createCommentDto.parentId) {
      const parentComment = await this.drizzle.db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.id, createCommentDto.parentId),
            eq(comments.postId, postId),
          ),
        );

      if (!parentComment[0]) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment[0].parentId) {
        throw new ForbiddenException('Nested replies are not allowed');
      }
    }

    const result = await this.drizzle.db
      .insert(comments)
      .values({
        content: createCommentDto.content,
        postId,
        userId,
        parentId: createCommentDto.parentId,
      })
      .returning();

    return result[0];
  }

  async toggleCommentLike(commentId: number, userId: number) {
    // Verify comment exists
    const comment = await this.drizzle.db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment[0]) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.drizzle.db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.commentId, commentId),
          eq(commentLikes.userId, userId),
        ),
      );

    if (existingLike.length > 0) {
      await this.drizzle.db
        .delete(commentLikes)
        .where(
          and(
            eq(commentLikes.commentId, commentId),
            eq(commentLikes.userId, userId),
          ),
        );
      return { liked: false };
    }

    await this.drizzle.db.insert(commentLikes).values({
      commentId,
      userId,
    });
    return { liked: true };
  }

  async getComments(postId: number) {
    // Verify post exists and is published
    await this.findOnePublished(postId);

    const result = await this.drizzle.db
      .select({
        comment: {
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          parentId: comments.parentId,
        },
        author: {
          id: users.id,
          username: users.username,
        },
        likesCount: sql<number>`count(${commentLikes.id})::int`,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(commentLikes, eq(comments.id, commentLikes.commentId))
      .where(eq(comments.postId, postId))
      .groupBy(comments.id, users.id)
      .orderBy(comments.createdAt);

    // Organize comments into threads
    const commentMap = new Map();
    const topLevelComments: any = [];

    result.forEach((item) => {
      const comment = {
        ...item.comment,
        author: item.author,
        likesCount: item.likesCount,
        replies: [],
      };
      commentMap.set(comment.id, comment);

      if (!comment.parentId) {
        topLevelComments.push(comment);
      } else {
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(comment);
        }
      }
    });

    return topLevelComments;
  }

  async updateComment(
    commentId: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.drizzle.db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment[0]) {
      throw new NotFoundException('Comment not found');
    }

    if (comment[0].userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const result = await this.drizzle.db
      .update(comments)
      .set({
        content: updateCommentDto.content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning();

    return result[0];
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.drizzle.db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId));

    if (!comment[0]) {
      throw new NotFoundException('Comment not found');
    }

    if (comment[0].userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete the comment and all its replies
    await this.drizzle.db
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)));

    return { id: commentId };
  }
}
