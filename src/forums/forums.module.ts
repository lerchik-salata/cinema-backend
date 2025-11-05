import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ForumsController } from "./forums.controller";
import { ForumsService } from "./forums.service";
import { ForumThread, ForumThreadSchema } from "./schemas/forum-thread.schema";
import { Post, PostSchema } from "./schemas/post.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ForumThread.name, schema: ForumThreadSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [ForumsController],
  providers: [ForumsService],
  exports: [ForumsService],
})
export class ForumsModule {}
