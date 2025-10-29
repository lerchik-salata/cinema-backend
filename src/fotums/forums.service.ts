import { Injectable } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { ForumThread } from "./interfaces/forum-thread.interface";
import { Post } from "./interfaces/post.interface";

@Injectable()
export class ForumsService {
  // імітатори БД
  private threads: ForumThread[] = [];
  private posts: Post[] = [];

  private nextThreadId = 1;
  private nextPostId = 1;

  private findOrCreateThread(movieId: string): ForumThread {
    let thread = this.threads.find((t) => t.movieId === movieId);

    if (!thread) {
      thread = {
        id: this.nextThreadId++,
        movieId: movieId,
        createdAt: new Date(),
      };
      this.threads.push(thread);
    }
    return thread;
  }

  createPost(authorId: string, movieId: string, dto: CreatePostDto): Post {
    const thread = this.findOrCreateThread(movieId);

    const newPost: Post = {
      id: this.nextPostId++,
      threadId: thread.id,
      authorId: authorId,
      content: dto.content,
      parentPostId: dto.parentPostId || null,
      createdAt: new Date(),
    };

    //збереження в імітатцію БД
    this.posts.push(newPost);
    return newPost;
  }

  getPostsByMovie(movieId: string): Post[] {
    const thread = this.threads.find((t) => t.movieId === movieId);

    if (!thread) {
      return [];
    }

    return this.posts.filter((p) => p.threadId === thread.id);
  }
}
