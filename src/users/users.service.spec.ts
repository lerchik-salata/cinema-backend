import { UsersService } from "./user.service";
import { Model, Document } from "mongoose";
import { User } from "../users/schemas/user.schema";
import { HashingService } from "../auth/hashing/hashing.service";

describe("UsersService (Unit Test)", () => {
  let service: UsersService;
  let userModel: jest.Mocked<Model<User & Document>>;
  let hashingService: jest.Mocked<HashingService>;

  const mockUpdatedUser: Partial<User> & { save: jest.Mock } = {
    username: "new_name",
    email: "test@mail.com",
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    userModel = {
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedUser),
      }),
    } as unknown as jest.Mocked<Model<User & Document>>;

    hashingService = {} as jest.Mocked<HashingService>;

    service = new UsersService(hashingService, userModel);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should update a user and return the new document", async () => {
    const updateDto = { username: "new_name" };

    const result = await service.update("testId", updateDto as any);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "testId",
      { $set: updateDto },
      { new: true },
    );

    expect(result.username).toEqual("new_name");
  });
});
