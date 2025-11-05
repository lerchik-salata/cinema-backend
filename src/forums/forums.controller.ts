import { Controller, Post, Body, Get, Param, Req, UseGuards, Patch, Delete } from "@nestjs/common";
import { ForumsService } from "./forums.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { Request } from "express";
import { Post as PostInterface } from "./schemas/post.schema";

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller("forums")
@UseGuards(JwtAuthGuard)
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Post(":movieId/posts")
  async createPost(
    @Param("movieId") movieId: string,
    @Body() createPostDto: CreatePostDto,
    @Req() req,
  ): Promise<PostInterface> {
    const authorId = (req as RequestWithUser).user.userId;
    return await this.forumsService.createPost(authorId, movieId, createPostDto);
  }

  @Get(":movieId/posts")
  async getPostsByMovie(@Param("movieId") movieId: string): Promise<PostInterface[]> {
    return await this.forumsService.getPostsByMovie(movieId);
  }

  @Patch("posts/:postId")
  async updatePost(
    @Param("postId") postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req,
  ): Promise<PostInterface> {
    const authorId = (req as RequestWithUser).user.userId;
    return await this.forumsService.updatePost(postId, updatePostDto.content, authorId);
  }

  @Delete("posts/:postId")
  async deletePost(@Param("postId") postId: string, @Req() req): Promise<void> {
    const authorId = (req as RequestWithUser).user.userId;
    return await this.forumsService.deletePost(postId, authorId);
  }
}
