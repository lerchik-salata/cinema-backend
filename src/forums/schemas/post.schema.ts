import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "ForumThread", // зв'язок з гілкою
    required: true,
  })
  threadId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Post", // зв'язок для відповідей
    default: null,
  })
  parentPostId: MongooseSchema.Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
