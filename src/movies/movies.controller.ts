import { Controller, Get, Param, Query, ValidationPipe } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import {
  CombinedMovieData,
  TmdbSearchResultDto,
  TmdbVideoDto,
} from "./interfaces/movie-data.interface";
import { FilterMoviesDto } from "./dto/filter-movies.dto";
import { SearchMovieDto } from "./dto/search-movie.dto";

@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  // Використовуємо DTO для фільтрів
  getFilteredMovies(@Query(new ValidationPipe({ transform: true })) dto: FilterMoviesDto) {
    if (!dto.genre && !dto.year) {
      // додати логіку популярних фільмів
    }
    return this.moviesService.getFilteredMovies(dto.genre, dto.year);
  }

  @Get("search")
  // Використовуємо DTO для пошуку
  searchMovies(
    @Query(new ValidationPipe({ transform: true })) dto: SearchMovieDto,
  ): Promise<TmdbSearchResultDto[]> {
    return this.moviesService.searchMovies(dto.query);
  }

  @Get(":id")
  getMovieById(@Param("id") id: string): Promise<CombinedMovieData> {
    return this.moviesService.getMovieById(id);
  }

  @Get(":id/trailers")
  getTrailers(@Param("id") id: string): Promise<TmdbVideoDto[]> {
    return this.moviesService.getTrailers(id);
  }
}
