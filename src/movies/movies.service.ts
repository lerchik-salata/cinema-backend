import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie, MovieDocument } from "./schemas/movie.schema";
import { ExternalApiService } from "./external-api.service";
import {
  CombinedMovieData,
  TmdbSearchResultDto,
  TmdbVideoDto,
} from "./interfaces/movie-data.interface";

@Injectable()
export class MoviesService {
  constructor(
    // 1. HttpService та ConfigService видалені
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private readonly externalApiService: ExternalApiService,
  ) {}

  private async upsertMovie(movieData: CombinedMovieData): Promise<MovieDocument> {
    const movie = await this.movieModel.findOneAndUpdate(
      { movieId: movieData.id.toString() },
      {
        $set: {
          movieId: movieData.id.toString(),
          title: movieData.title,
          tmdbRating: movieData.vote_average_tmdb,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
    return movie;
  }

  // getMovieById
  async getMovieById(id: string): Promise<CombinedMovieData> {
    const cacheKey = `MOVIE_${id}`;
    const cachedData = await this.cacheManager.get<CombinedMovieData>(cacheKey);
    if (cachedData) {
      console.log(`LOG: Повертаю фільм ${id} з кешу`);
      return cachedData;
    }
    console.log(`LOG: Запитую фільм ${id} з API`);

    // Делегуємо виклики API
    const tmdbData = await this.externalApiService.fetchTmdbMovie(id);
    const omdbData = await this.externalApiService.fetchOmdbData(tmdbData.imdb_id);

    const combinedData: CombinedMovieData = {
      id: tmdbData.id,
      title: tmdbData.title,
      overview: tmdbData.overview,
      poster_path: `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`,
      release_date: tmdbData.release_date,
      genres: tmdbData.genres,
      vote_average_tmdb: tmdbData.vote_average,
      rated: omdbData.Rated,
      awards: omdbData.Awards,
      ratings_omdb: omdbData.Ratings,
    };

    // Логіка кешування та збереження в БД
    this.upsertMovie(combinedData).catch((err) => console.error("Failed to upsert movie", err));

    await this.cacheManager.set(cacheKey, combinedData);
    return combinedData;
  }

  // searchMovies
  async searchMovies(query: string): Promise<TmdbSearchResultDto[]> {
    const cacheKey = `SEARCH_${query}`;
    const cachedData = await this.cacheManager.get<TmdbSearchResultDto[]>(cacheKey);
    if (cachedData) {
      console.log(`LOG: Повертаю пошук "${query}" з кешу`);
      return cachedData;
    }
    console.log(`LOG: Запитую пошук "${query}" з API`);

    // Делегуємо виклик API
    const { results } = await this.externalApiService.searchTmdb(query);

    await this.cacheManager.set(cacheKey, results, 600);
    return results;
  }

  // getTrailers
  async getTrailers(id: string): Promise<TmdbVideoDto[]> {
    const cacheKey = `TRAILERS_${id}`;
    const cachedData = await this.cacheManager.get<TmdbVideoDto[]>(cacheKey);
    if (cachedData) {
      console.log(`LOG: Повертаю трейлери ${id} з кешу`);
      return cachedData;
    }
    console.log(`LOG: Запитую трейлери ${id} з API`);

    // Делегуємо виклик API
    const trailers = await this.externalApiService.fetchTrailers(id);

    await this.cacheManager.set(cacheKey, trailers);
    return trailers;
  }

  // Фільтри (заглушка)
  getFilteredMovies(genre?: string, year?: string): { message: string } {
    return { message: `Пошук з фільтрами: жанр=${genre}, рік=${year}` };
  }
}
