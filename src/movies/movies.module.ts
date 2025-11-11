import { Module } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MoviesController } from "./movies.controller";
import { HttpModule } from "@nestjs/axios";
import { MongooseModule } from "@nestjs/mongoose";
import { Movie, MovieSchema } from "./schemas/movie.schema";
import { ExternalApiService } from "./external-api.service";

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }])],
  controllers: [MoviesController],
  providers: [MoviesService, ExternalApiService],
  exports: [MoviesService],
})
export class MoviesModule {}
