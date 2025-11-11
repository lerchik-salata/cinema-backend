// Перемісти СЮДИ всі інтерфейси з movies.service.ts

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
