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

  getAllPosts(): Post[] {
    return this.posts;
  }

  getPostsByMovie(movieId: string): Post[] {
    const thread = this.threads.find((t) => t.movieId === movieId);

    if (!thread) {
      return [];
    }

    return this.posts.filter((p) => p.threadId === thread.id);
  }

  updatePost(postId: number, content: string): Post {
    const post = this.posts.find((p) => p.id === postId);

    if (!post) {
      throw new Error("Post not found");
    }

    post.content = content;
    (post as { updatedAt?: Date }).updatedAt = new Date();

    return post;
  }

  deletePost(postId: number): void {
    const initialLength = this.posts.length;

    this.posts = this.posts.filter((p) => p.id !== postId);

    if (this.posts.length === initialLength) {
      throw new Error("Post not found");
    }
  }
}
