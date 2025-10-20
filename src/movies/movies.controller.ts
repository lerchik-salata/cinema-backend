import { Controller, Get, Param, Query } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { CombinedMovieData, TmdbSearchResultDto, TmdbVideoDto } from "./movies.service";

@Controller("movies") // Всі запити будуть /movies/...
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // Фільтри (має бути ПЕРЕД :id, щоб :id не перехопив 'search')
  // GET /movies?genre=...&year=...
  @Get()
  getFilteredMovies(@Query("genre") genre?: string, @Query("year") year?: string) {
    // Якщо параметрів немає, можна повертати популяр
    if (!genre && !year) {
      // додати логіку популярних фільмів
    }
    return this.moviesService.getFilteredMovies(genre, year);
  }

  // Пошук
  // GET /movies/search?query=...
  @Get("search")
  searchMovies(@Query("query") query: string): Promise<TmdbSearchResultDto[]> {
    return this.moviesService.searchMovies(query);
  }

  // Деталі про фільм
  // GET /movies/123
  @Get(":id")
  getMovieById(@Param("id") id: string): Promise<CombinedMovieData> {
    return this.moviesService.getMovieById(id);
  }

  // Трейлери
  // GET /movies/123/trailers
  @Get(":id/trailers")
  getTrailers(@Param("id") id: string): Promise<TmdbVideoDto[]> {
    return this.moviesService.getTrailers(id);
  }
}
