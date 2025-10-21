import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "src/users/user.service";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "src/users/dto/user.dto";

@Injectable()
export class AdminUsersService {
  constructor(private usersService: UsersService) {}

  async findAll(): Promise<UserResponseDto[]> {
    await Promise.resolve();
    const allUsers = this.usersService["users"];

    return plainToInstance(UserResponseDto, allUsers, { excludeExtraneousValues: true });
  }

  async findOneById(id: string): Promise<UserResponseDto> {
    await Promise.resolve();
    const user = this.usersService["users"].find((u) => u._id === id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  async update(id: string, updateData: Partial<UserResponseDto>): Promise<UserResponseDto> {
    await Promise.resolve();
    const user = this.usersService["users"].find((u) => u._id === id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    Object.assign(user, updateData);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    await Promise.resolve();
    const userIndex = this.usersService["users"].findIndex((u) => u._id === id);
    if (userIndex === -1) {
      throw new NotFoundException("User not found");
    }

    this.usersService["users"].splice(userIndex, 1);
    return { message: `User ${id} successfully deleted` };
  }
}
