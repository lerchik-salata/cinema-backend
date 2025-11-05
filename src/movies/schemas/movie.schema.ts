import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true }) // timestamps додасть createdAt і updatedAt
export class Movie {
  @Prop({ required: true, unique: true, type: String })
  movieId: string; // Це буде TMDB ID (наприклад, '438631')

  @Prop({ required: true })
  title: string;

  @Prop()
  tmdbRating: number;

  @Prop({ default: 0 })
  popularityScore: number; // Для рекомендацій, як ми обговорювали
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
