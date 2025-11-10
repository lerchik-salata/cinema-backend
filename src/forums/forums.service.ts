import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreatePostDto } from "./dto/create-post.dto";
import { ForumThread, ForumThreadDocument } from "./schemas/forum-thread.schema";
import { Post, PostDocument } from "./schemas/post.schema";

@Injectable()
export class ForumsService {
  constructor(
    @InjectModel(ForumThread.name)
    private threadModel: Model<ForumThreadDocument>,
    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,
  ) {}

  private async findOrCreateThread(movieId: string): Promise<ForumThreadDocument> {
    let thread = await this.threadModel.findOne({ movieId }).exec();

    if (!thread) {
      thread = await this.threadModel.create({ movieId });
    }
    return thread;
  }
  async createPost(authorId: string, movieId: string, dto: CreatePostDto): Promise<Post> {
    const thread = await this.findOrCreateThread(movieId);
    const newPost = await this.postModel.create({
      authorId: authorId,
      threadId: thread._id,
      content: dto.content,
      parentPostId: dto.parentPostId ? new Types.ObjectId(dto.parentPostId) : null,
    });

    return newPost;
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postModel.find().exec();
  }
  //пошук постів за фільмом
  async getPostsByMovie(movieId: string): Promise<Post[]> {
    const thread = await this.threadModel.findOne({ movieId }).exec();
    if (!thread) {
      return [];
    }
    return this.postModel
      .find({ threadId: thread._id })
      .sort({ createdAt: 1 }) // Сортування за датою
      .exec();
  }

  async updatePost(postId: string, content: string, authorId: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findOneAndUpdate({ _id: postId, authorId: authorId }, { content: content }, { new: true })
      .exec();
    if (!updatedPost) {
      throw new NotFoundException("Post not found or you do not have permission to edit it");
    }
    return updatedPost;
  }

  async updatePostAsAdmin(postId: string, content: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(postId, { content: content }, { new: true })
      .exec();

    if (!updatedPost) {
      throw new NotFoundException("Post not found");
    }
    return updatedPost;
  }

  async deletePost(postId: string, authorId: string): Promise<void> {
    const result = await this.postModel
      .findOneAndDelete({
        _id: postId,
        authorId: authorId,
      })
      .exec();

    if (!result) {
      throw new NotFoundException("Post not found or you do not have permission to delete it");
    }
  }

  async deletePostAsAdmin(postId: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(postId).exec();

    if (!result) {
      throw new NotFoundException("Post not found");
    }
  }
}
