import { Module } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MoviesController } from "./movies.controller";
import { HttpModule } from "@nestjs/axios"; // Імпорт

@Module({
  imports: [
    HttpModule, // Додаємо сюди
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
