import request, { Response } from "supertest";
import { INestApplication, ValidationPipe, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";

// Интерфейс ответа соответствует CoreAuthResponse из types.ts
interface AuthResponse {
  accessToken: string;
  user: {
    _id: string; // Библиотека возвращает _id
    email: string;
    username: string;
  };
}

const unique = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

describe("AuthModule (E2E API)", () => {
  let app: INestApplication;
  let server: request.SuperTest<request.Test>;

  const password = "Password123!"; // Пароль посложнее
  const email = `e2e_${unique()}@test.com`;
  const username = `user_${unique()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    // @ts-ignore
    server = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("should register a user and return accessToken", async () => {
      const res: Response = await server
        .post("/auth/register")
        .send({
          email,
          username,
          password,
        })
        .expect(HttpStatus.CREATED);

      const body = res.body as AuthResponse;

      // Проверяем поля согласно types.ts
      expect(body.accessToken).toBeDefined();
      expect(typeof body.accessToken).toBe("string");

      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(email);
      expect(body.user.username).toBe(username);
      expect(body.user._id).toBeDefined();
    });

    it("should return 409 if email already exists", async () => {
      await server
        .post("/auth/register")
        .send({
          email, // Тот же email
          username: `another_${unique()}`,
          password,
        })
        .expect(HttpStatus.CONFLICT);
    });

    it("should return 400 for weak password", async () => {
      await server
        .post("/auth/register")
        .send({
          email: `weak_${unique()}@test.com`,
          username: `weak_${unique()}`,
          password: "123",
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("POST /auth/login", () => {
    it("should login and return accessToken", async () => {
      const res: Response = await server
        .post("/auth/login")
        .send({
          email,
          password,
        })
        .expect(HttpStatus.OK);

      const body = res.body as AuthResponse;

      expect(body.accessToken).toBeDefined();
      expect(body.user.email).toBe(email);
    });

    it("should return 401 for wrong password", async () => {
      await server
        .post("/auth/login")
        .send({
          email,
          password: "wrongPassword!!!",
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return 401 for non-existing user", async () => {
      await server
        .post("/auth/login")
        .send({
          email: `no_such_${unique()}@mail.com`,
          password,
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
