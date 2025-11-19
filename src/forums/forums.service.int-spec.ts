import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Model, Connection, connect } from "mongoose";
import { ForumsService } from "./forums.service";
import { Post, PostSchema, PostDocument } from "./schemas/post.schema";
import { ForumThread, ForumThreadSchema } from "./schemas/forum-thread.schema";
import { CreatePostDto } from "./dto/create-post.dto";

const idToString = (value: unknown): string => {
  return String(value);
};

describe("ForumsService (Integration)", () => {
  let forumsService: ForumsService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let postModel: Model<Post>;
  let threadModel: Model<ForumThread>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Post.name, schema: PostSchema },
          { name: ForumThread.name, schema: ForumThreadSchema },
        ]),
      ],
      providers: [ForumsService],
    }).compile();

    forumsService = module.get<ForumsService>(ForumsService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));
    threadModel = module.get<Model<ForumThread>>(getModelToken(ForumThread.name));

    mongoConnection = (await connect(uri)).connection;
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it("should create a NEW thread and a NEW post for the first comment", async () => {
    const movieId = "movie-100";
    const userId = "user-A";
    const dto: CreatePostDto = { content: "First comment!" };

    await forumsService.createPost(userId, movieId, dto);

    const threads = await threadModel.find({ movieId });
    const posts = await postModel.find({ content: "First comment!" });

    expect(threads).toHaveLength(1);
    expect(posts).toHaveLength(1);

    expect(idToString(posts[0].threadId)).toBe(idToString(threads[0]._id));
  });

  it("should REUSE existing thread for the second comment", async () => {
    const movieId = "movie-100";

    await forumsService.createPost("user-A", movieId, { content: "First" });

    await forumsService.createPost("user-B", movieId, { content: "Second" });

    const threads = await threadModel.find({ movieId });
    expect(threads).toHaveLength(1);

    const posts = await postModel.find();
    expect(posts).toHaveLength(2);

    const threadIdStr = idToString(threads[0]._id);
    expect(idToString(posts[0].threadId)).toBe(threadIdStr);
    expect(idToString(posts[1].threadId)).toBe(threadIdStr);
  });

  it("should delete a post from DB", async () => {
    const post = (await forumsService.createPost("user-A", "movie-X", {
      content: "To delete",
    })) as PostDocument;

    await forumsService.deletePost(idToString(post._id), "user-A");

    const deletedPost = await postModel.findById(post._id);
    expect(deletedPost).toBeNull();
  });
});
