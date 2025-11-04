import { Injectable, NotFoundException } from "@nestjs/common";
import { ForumsService } from "src/forums/forums.service";
import { UpdatePostDto } from "src/forums/dto/update-post.dto";
import { Post } from "src/forums/interfaces/post.interface";

@Injectable()
export class AdminForumsService {
  constructor(private forumsService: ForumsService) {}

  getAllPosts(): Post[] {
    return this.forumsService.getAllPosts();
  }

  updatePost(postId: number, updatePostDto: UpdatePostDto): Post {
    try {
      return this.forumsService.updatePost(postId, updatePostDto.content);
    } catch (e) {
      if (e instanceof Error && e.message.includes("not found")) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  deletePost(postId: number): { message: string } {
    try {
      this.forumsService.deletePost(postId);
      return { message: `Post ${postId} successfully deleted.` };
    } catch (e) {
      if (e instanceof Error && e.message.includes("not found")) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
