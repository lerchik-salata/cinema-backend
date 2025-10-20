import { Inject, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { firstValueFrom } from "rxjs";

export interface TmdbMovieDto {
  id: number;
  imdb_id: string;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
}

export interface OmdbMovieDto {
  Rated: string;
  Awards: string;
  Ratings: { Source: string; Value: string }[];
}

export interface TmdbVideoDto {
  site: string;
  type: string;
  key: string;
  name: string;
}

export interface TmdbSearchResultDto {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
}

export interface TmdbSearchDto {
  results: TmdbSearchResultDto[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface CombinedMovieData {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  genres: { id: number; name: string }[];
  vote_average_tmdb: number;
  rated: string;
  awards: string;
  ratings_omdb: { Source: string; Value: string }[];
}

@Injectable()
export class MoviesService {
  private readonly tmdbApiKey: string;
  private readonly omdbApiKey: string;
  private readonly tmdbBaseUrl = "https://api.themoviedb.org/3";

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Дістаємо API ключі
    this.tmdbApiKey = this.configService.get<string>("TMDB_API_KEY")!;
    // '!', бо ми впевнені, що ключ є та не може бути undefined, а так помилка, бо тип може бути string | undefined
    this.omdbApiKey = this.configService.get<string>("OMDB_API_KEY")!;
  }

  // Деталі про фільм
  async getMovieById(id: string): Promise<CombinedMovieData> {
    const cacheKey = `MOVIE_${id}`;
    // Типізуємо кеш
    const cachedData = await this.cacheManager.get<CombinedMovieData>(cacheKey);
    if (cachedData) {
      console.log(`LOG: Повертаю фільм ${id} з кешу`);
      return cachedData;
    }
    console.log(`LOG: Запитую фільм ${id} з API`);

    // Запит до TMDB (типізуємо відповідь <TmdbMovieDto>)
    const tmdbUrl = `${this.tmdbBaseUrl}/movie/${id}?api_key=${this.tmdbApiKey}&language=uk-UA`;
    const tmdbPromise = firstValueFrom(this.httpService.get<TmdbMovieDto>(tmdbUrl));

    // Дістаємо дані ТУТ, щоб отримати imdb_id
    const { data: tmdbData } = await tmdbPromise; // tmdbData тепер має тип TmdbMovieDto, а не 'any'
    const imdbId = tmdbData.imdb_id; // Отримуємо imdb_id з типізованих даних

    // Запит до OMDB (типізуємо відповідь <OmdbMovieDto>)
    const omdbUrl = `https://www.omdbapi.com/?i=${imdbId}&apikey=${this.omdbApiKey}`;
    const omdbPromise = firstValueFrom(this.httpService.get<OmdbMovieDto>(omdbUrl));

    const { data: omdbData } = await omdbPromise; // omdbData тепер має тип OmdbMovieDto

    const combinedData: CombinedMovieData = {
      // додав типізацію, бо раніше було 'any' і це видавало помилку
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

    await this.cacheManager.set(cacheKey, combinedData);
    return combinedData;
  }

  // Пошук
  async searchMovies(query: string) {
    const cacheKey = `SEARCH_${query}`;

    // Типізуємо кеш:
    const cachedData = await this.cacheManager.get<TmdbSearchResultDto[]>(cacheKey);
    if (cachedData) {
      console.log(`LOG: Повертаю пошук "${query}" з кешу`);
      return cachedData;
    }
    console.log(`LOG: Запитую пошук "${query}" з API`);

    const url = `${this.tmdbBaseUrl}/search/movie?api_key=${this.tmdbApiKey}&query=${query}&language=uk-UA`;

    // вказуємо наш новий тип TmdbSearchDto
    const { data } = await firstValueFrom(this.httpService.get<TmdbSearchDto>(url));
    await this.cacheManager.set(cacheKey, data.results, 600);
    return data.results;
  }

  // Трейлери (з TMDB)
  async getTrailers(id: string) {
    const cacheKey = `TRAILERS_${id}`;
    // Типізуємо кеш:
    const cachedData = await this.cacheManager.get<TmdbVideoDto[]>(cacheKey);
    if (cachedData) {
      console.log(`LOG: Повертаю трейлери ${id} з кешу`);
      return cachedData;
    }
    console.log(`LOG: Запитую трейлери ${id} з API`);

    const url = `${this.tmdbBaseUrl}/movie/${id}/videos?api_key=${this.tmdbApiKey}`;
    const { data } = await firstValueFrom(this.httpService.get<{ results: TmdbVideoDto[] }>(url));
    const trailers = data.results.filter(
      (video: TmdbVideoDto) => video.site === "YouTube" && video.type === "Trailer",
    );
    await this.cacheManager.set(cacheKey, trailers);
    return trailers;
  }

  // Фільтри
  getFilteredMovies(genre?: string, year?: string): { message: string } {
    // Тут буде логіка для TMDB (поки заглушка) /discover/movie
    return { message: `Пошук з фільтрами: жанр=${genre}, рік=${year}` };
  }
}
