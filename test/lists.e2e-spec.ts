import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { Server } from "http";
import { UsersService } from "../src/users/user.service";
import { HashingService } from "../src/auth/hashing/hashing.service";
import { UserRole } from "../src/users/enums/user-role.enum";

interface LoginResponse {
  access_token: string;
}

interface List {
  _id: string;
  movieId: string;
  listType: string;
}

describe("Lists System (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let usersService: UsersService;
  let hashingService: HashingService;

  const testUser = {
    username: "john",
    email: "john@test.com",
    password: "changeme",
    role: UserRole.USER,
  };

  const movieId = "123";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    hashingService = moduleFixture.get<HashingService>(HashingService);

    const existingUser = await usersService.findOneByEmail(testUser.email);
    if (!existingUser) {
      const passwordHash = await hashingService.hashPassword(testUser.password);
      await usersService.create(
        { email: testUser.email, username: testUser.username, password: testUser.password },
        passwordHash,
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("/auth/login (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/auth/login")
      .send({ email: "john@test.com", password: "changeme" })
      .expect(HttpStatus.OK);

    const body = response.body as LoginResponse;
    accessToken = body.access_token;

    expect(accessToken).toBeDefined();
  });

  it("/lists (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/lists")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ movieId: movieId, listType: "watched" })
      .expect(HttpStatus.CREATED);

    const body = response.body as List;
    expect(body.listType).toBe("watched");
  });

  it("/lists/my (GET)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .get("/lists/my")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const body = response.body as List[];

    expect(body.length).toBeGreaterThan(0);
    expect(body[0]._id).toBeDefined();
  });

  it("/lists/:id (DELETE)", async () => {
    await request(app.getHttpServer() as Server)
      .delete(`/lists/${movieId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });
});
