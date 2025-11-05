import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ForumThreadDocument = ForumThread & Document;

@Schema({ timestamps: true })
export class ForumThread {
  @Prop({ required: true, unique: true })
  movieId: string;
}

export const ForumThreadSchema = SchemaFactory.createForClass(ForumThread);
