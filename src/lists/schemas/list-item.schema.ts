import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export enum ListType {
  WANT_TO_WATCH = "wantToWatch",
  WATCHED = "watched",
  FAVORITE = "favorite",
}

export type ListItemDocument = ListItem & Document;

@Schema({ timestamps: true })
export class ListItem {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  movieId: string;

  @Prop({ required: true, enum: ListType })
  listType: string;
}

export const ListItemSchema = SchemaFactory.createForClass(ListItem);

ListItemSchema.index({ userId: 1, movieId: 1 }, { unique: true });
