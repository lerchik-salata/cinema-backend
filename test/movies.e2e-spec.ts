import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import {
  TmdbSearchResultDto,
  CombinedMovieData,
  TmdbVideoDto,
} from "../src/movies/interfaces/movie-data.interface";

describe("MoviesModule (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Тест пошуку
  it("/movies/search (GET) - should return array of movies", () => {
    return request(app.getHttpServer())
      .get("/movies/search?query=Dune")
      .expect(200)
      .expect((res) => {
        const body = res.body as TmdbSearchResultDto[];

        expect(Array.isArray(body)).toBe(true);

        if (body.length > 0) {
          expect(body[0]).toHaveProperty("id");
          expect(body[0]).toHaveProperty("title");
        }
      });
  });

  // Тест деталей фільму
  it("/movies/:id (GET) - should return combined movie details", async () => {
    const searchRes = await request(app.getHttpServer()).get("/movies/search?query=Dune");
    const searchBody = searchRes.body as TmdbSearchResultDto[];
    const movieId = searchBody[0].id;

    return request(app.getHttpServer())
      .get(`/movies/${movieId}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as CombinedMovieData;

        expect(body).toHaveProperty("id", movieId);
        expect(body).toHaveProperty("title");
        expect(body).toHaveProperty("overview");

        expect(body).toHaveProperty("rated");
        expect(body).toHaveProperty("awards");
        expect(body).toHaveProperty("ratings_omdb");
      });
  });

  // Тест трейлерів
  it("/movies/:id/trailers (GET) - should return array of trailers", async () => {
    const searchRes = await request(app.getHttpServer()).get("/movies/search?query=Dune");
    const searchBody = searchRes.body as TmdbSearchResultDto[];
    const movieId = searchBody[0].id;

    return request(app.getHttpServer())
      .get(`/movies/${movieId}/trailers`)
      .expect(200)
      .expect((res) => {
        const body = res.body as TmdbVideoDto[];

        expect(Array.isArray(body)).toBe(true);

        if (body.length > 0) {
          expect(body[0]).toHaveProperty("key");
          expect(body[0]).toHaveProperty("site", "YouTube");
          expect(body[0]).toHaveProperty("type", "Trailer");
        }
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
