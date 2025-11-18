import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { MoviesService } from "./movies.service";
import { Movie, MovieSchema, MovieDocument } from "./schemas/movie.schema";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ExternalApiService } from "./external-api.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { of } from "rxjs";
import { Model } from "mongoose";

// НАЛАШТУВАННЯ ТЕСТОВОЇ БД
let mongo: MongoMemoryServer;
let moduleRef: TestingModule;

// Мок для ExternalApiService
const mockExternalApiService = {
  fetchTmdbMovie: jest.fn().mockResolvedValue({
    id: 99999,
    imdb_id: "tt123",
    title: "Integration Test Movie",
    vote_average: 8.5,
  }),
  fetchOmdbData: jest.fn().mockResolvedValue({ Rated: "PG-13", Awards: "None", Ratings: [] }),
  fetchTrailers: jest.fn().mockResolvedValue([]),
  searchTmdb: jest.fn().mockResolvedValue({ results: [] }),
};

describe("MoviesService (Integration)", () => {
  let service: MoviesService;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
      ],
      providers: [
        MoviesService,
        { provide: ExternalApiService, useValue: mockExternalApiService },
        { provide: CACHE_MANAGER, useValue: { get: () => null, set: () => Promise.resolve() } },
        { provide: HttpService, useValue: { get: () => of({ data: {} }) } },
        { provide: ConfigService, useValue: { get: () => "mock_key" } },
      ],
    }).compile();

    service = moduleRef.get<MoviesService>(MoviesService);
  });

  afterAll(async () => {
    await moduleRef.close();
    await mongo.stop();
  });

  it("should insert a new Movie into MongoDB after fetching data", async () => {
    // ARRANGE
    const movieId = "99999";

    await service.getMovieById(movieId);

    // Даємо час на асинхронний запис, бо запис в бд ще не встиг створитися, а тест вже отримав даны від getMovieById
    await new Promise((resolve) => setTimeout(resolve, 500));

    const movieModel = moduleRef.get<Model<MovieDocument>>(getModelToken(Movie.name));

    const savedMovie = await movieModel.findOne({ movieId: movieId });

    expect(savedMovie).toBeDefined();
    expect(savedMovie!.title).toBe("Integration Test Movie");
    expect(savedMovie!.tmdbRating).toBe(8.5);
  });
});
