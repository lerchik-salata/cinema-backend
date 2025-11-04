import { Controller, Post, Body, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ForumsService } from "./forums.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePostDto } from "./dto/create-post.dto";
import type { Post as PostInterface } from "./interfaces/post.interface";
import { Request } from "express";

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller("forums")
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(":movieId/posts")
  createPost(@Param("movieId") movieId: string, @Body() createPostDto: CreatePostDto, @Req() req) {
    const authorId = (req as RequestWithUser).user.userId;
    return this.forumsService.createPost(authorId, movieId, createPostDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get(":movieId/posts")
  getPostsByMovie(@Param("movieId") movieId: string): PostInterface[] {
    return this.forumsService.getPostsByMovie(movieId);
  }
}
