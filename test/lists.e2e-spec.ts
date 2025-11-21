import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { Server } from "http";

interface LoginResponse {
  access_token: string;
}

interface List {
  _id: string;
  title: string;
  description?: string;
}

describe("Lists System (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let createdListId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/auth/login (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/auth/login")
      .send({ username: "john", password: "changeme" })
      .expect(201);

    const body = response.body as LoginResponse;
    accessToken = body.access_token;

    expect(accessToken).toBeDefined();
  });

  it("/lists (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/lists")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "My New List", description: "Test description" })
      .expect(201);

    const body = response.body as List;
    createdListId = body._id;
    expect(body.title).toBe("My New List");
  });

  it("/lists (GET)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .get("/lists")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const body = response.body as List[];

    expect(body.length).toBeGreaterThan(0);
    expect(body[0]._id).toBeDefined();
  });

  it("/lists/:id (DELETE)", async () => {
    if (createdListId) {
      await request(app.getHttpServer() as Server)
        .delete(`/lists/${createdListId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
    }
  });
});
