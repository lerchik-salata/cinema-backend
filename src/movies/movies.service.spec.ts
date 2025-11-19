import { Test, TestingModule } from "@nestjs/testing";
import { MoviesService } from "./movies.service";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { getModelToken } from "@nestjs/mongoose";
import { Movie } from "./schemas/movie.schema";
import { ExternalApiService } from "./external-api.service";

const mockHttpService = {
  get: jest.fn(),
};
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === "TMDB_API_KEY") return "mock_tmdb_key";
    if (key === "OMDB_API_KEY") return "mock_omdb_key";
    return null;
  }),
};
const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};
const mockMovieModel = {
  findOneAndUpdate: jest.fn(),
};

const mockExternalApiService = {
  searchTmdb: jest.fn(),
  fetchTmdbMovie: jest.fn(),
  fetchOmdbData: jest.fn(),
  fetchTrailers: jest.fn(),
};

describe("MoviesService", () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: getModelToken(Movie.name), useValue: mockMovieModel },
        { provide: ExternalApiService, useValue: mockExternalApiService },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("searchMovies", () => {
    it("should return cached data if available", async () => {
      const query = "Dune";
      const cachedResult = [{ id: 1, title: "Dune Cached" }];

      // Налаштовуємо мок, щоб кеш повертав дані
      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.searchMovies(query);

      expect(mockCacheManager.get).toHaveBeenCalledWith(`SEARCH_${query}`);
      expect(result).toEqual(cachedResult);
      // Перевіряємо, що зовнішній API не викликався
      expect(mockExternalApiService.searchTmdb).not.toHaveBeenCalled();
    });

    it("should call API and cache result if cache is empty", async () => {
      const query = "Matrix";
      const apiResult = { results: [{ id: 2, title: "Matrix" }] };

      // Кеш пустий
      mockCacheManager.get.mockResolvedValue(null);
      // API повертає дані
      mockExternalApiService.searchTmdb.mockResolvedValue(apiResult);

      const result = await service.searchMovies(query);

      expect(mockExternalApiService.searchTmdb).toHaveBeenCalledWith(query);
      expect(mockCacheManager.set).toHaveBeenCalled(); // Перевірка, що записалося в кеш
      expect(result).toEqual(apiResult.results);
    });
  });

  describe("getMovieById", () => {
    it("should return combined data from API", async () => {
      const movieId = "123";
      const tmdbMock = { id: 123, imdb_id: "tt123", title: "Test Movie", vote_average: 8 };
      const omdbMock = { Rated: "PG", Awards: "Oscar", Ratings: [] };

      mockCacheManager.get.mockResolvedValue(null);
      mockExternalApiService.fetchTmdbMovie.mockResolvedValue(tmdbMock);
      mockExternalApiService.fetchOmdbData.mockResolvedValue(omdbMock);
      // Мокаємо upsert, щоб повернув щось (null або об'єкт)
      mockMovieModel.findOneAndUpdate.mockResolvedValue({});

      const result = await service.getMovieById(movieId);

      expect(result.title).toBe("Test Movie");
      expect(result.rated).toBe("PG");
      // Перевіряємо, що викликали збереження в БД
      expect(mockMovieModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
