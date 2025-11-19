import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Model, Connection, connect } from "mongoose";
import { ListsService } from "./lists.service";
import { ListItem, ListItemSchema } from "./schemas/list-item.schema";
import { AddToListDto, ListType } from "./dto/add-to-list.dto";

describe("ListsService (Integration)", () => {
  let listsService: ListsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let listItemModel: Model<ListItem>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: ListItem.name, schema: ListItemSchema }]),
      ],
      providers: [ListsService],
    }).compile();

    listsService = module.get<ListsService>(ListsService);
    listItemModel = module.get<Model<ListItem>>(getModelToken(ListItem.name));
    mongoConnection = (await connect(uri)).connection;
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it("should be defined", () => {
    expect(listsService).toBeDefined();
  });

  it("should save a movie to the database", async () => {
    const userId = "user-123";
    const dto: AddToListDto = {
      movieId: "movie-555",
      listType: ListType.FAVORITE,
    };

    const result = await listsService.addToList(userId, dto);

    expect(result.userId).toBe(userId);
    expect(result.listType).toBe(ListType.FAVORITE);

    const savedItem = await listItemModel.findOne({ userId, movieId: dto.movieId });
    expect(savedItem).toBeDefined();
    expect(savedItem?.listType).toBe(ListType.FAVORITE);
  });

  it("should update list type if item already exists (Upsert)", async () => {
    const userId = "user-123";
    await listItemModel.create({
      userId,
      movieId: "movie-555",
      listType: ListType.WANT_TO_WATCH,
    });

    const dto: AddToListDto = {
      movieId: "movie-555",
      listType: ListType.WATCHED,
    };

    await listsService.addToList(userId, dto);

    const items = await listItemModel.find({ userId });
    expect(items.length).toBe(1);
    expect(items[0].listType).toBe(ListType.WATCHED);
  });

  it("should remove item from database", async () => {
    const userId = "user-del";
    await listItemModel.create({ userId, movieId: "m-1", listType: ListType.FAVORITE });

    await listsService.removeFromList(userId, "m-1");

    const item = await listItemModel.findOne({ userId, movieId: "m-1" });
    expect(item).toBeNull();
  });
});
