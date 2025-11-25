import { Injectable, NotFoundException } from "@nestjs/common";
import { ForumsService } from "../../forums/forums.service";
import { UpdatePostDto } from "../../forums/dto/update-post.dto";
import { Post } from "../../forums/schemas/post.schema";
import { PostResponseDto } from "../../forums/dto/post-response.dto";

@Injectable()
export class AdminForumsService {
  constructor(private forumsService: ForumsService) {}

  async getAllPosts(): Promise<PostResponseDto[]> {
    return await this.forumsService.getAllPosts();
  }

  async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      return await this.forumsService.updatePostAsAdmin(postId, updatePostDto.content);
    } catch (e) {
      if (e instanceof Error && e.message.includes("not found")) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  async deletePost(postId: string): Promise<{ message: string }> {
    try {
      await this.forumsService.deletePostAsAdmin(postId);
      return { message: `Post ${postId} successfully deleted.` };
    } catch (e) {
      if (e instanceof Error && e.message.includes("not found")) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
