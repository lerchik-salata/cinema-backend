import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import {
  OmdbMovieDto,
  TmdbMovieDto,
  TmdbSearchDto,
  TmdbVideoDto,
} from "./interfaces/movie-data.interface";

@Injectable()
export class ExternalApiService {
  private readonly tmdbApiKey: string;
  private readonly omdbApiKey: string;
  private readonly tmdbBaseUrl = "https://api.themoviedb.org/3";

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tmdbApiKey = this.configService.get<string>("TMDB_API_KEY")!;
    this.omdbApiKey = this.configService.get<string>("OMDB_API_KEY")!;
  }

  // Пошук
  async searchTmdb(query: string): Promise<TmdbSearchDto> {
    const url = `${this.tmdbBaseUrl}/search/movie?api_key=${this.tmdbApiKey}&query=${query}&language=uk-UA`;
    const { data } = await firstValueFrom(this.httpService.get<TmdbSearchDto>(url));
    return data;
  }

  // Деталі з TMDB
  async fetchTmdbMovie(id: string): Promise<TmdbMovieDto> {
    const url = `${this.tmdbBaseUrl}/movie/${id}?api_key=${this.tmdbApiKey}&language=uk-UA`;
    const { data } = await firstValueFrom(this.httpService.get<TmdbMovieDto>(url));
    return data;
  }

  // Деталі з OMDB
  async fetchOmdbData(imdbId: string): Promise<OmdbMovieDto> {
    if (!imdbId) {
      // Повертаємо заглушку, якщо IMDB ID немає
      return { Rated: "N/A", Awards: "N/A", Ratings: [] };
    }
    try {
      const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${this.omdbApiKey}`;
      const { data } = await firstValueFrom(this.httpService.get<OmdbMovieDto>(url));
      return data;
    } catch (e) {
      // Додаємо перевірку типу, щоб безпечно отримати повідомлення про помилку, бо еслінт не пускає без неї
      if (e instanceof Error) {
        console.error("OMDB fetch error, returning fallback:", e.message);
      } else {
        // Якщо це не стандартна помилка Error, виводимо її як є
        console.error("OMDB fetch error, returning fallback. Unknown error:", e);
      }

      // Якщо OMDB не спрацював, ми повертаємо заглушку, щоб не зламати нам сайт нафіг
      return { Rated: "N/A", Awards: "N/A", Ratings: [] };
    }
  }

  // Трейлери
  async fetchTrailers(id: string): Promise<TmdbVideoDto[]> {
    const url = `${this.tmdbBaseUrl}/movie/${id}/videos?api_key=${this.tmdbApiKey}`;
    const { data } = await firstValueFrom(this.httpService.get<{ results: TmdbVideoDto[] }>(url));
    return data.results.filter((video) => video.site === "YouTube" && video.type === "Trailer");
  }
}
