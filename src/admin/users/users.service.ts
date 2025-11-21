import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "../../users/user.service";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "../../users/dto/user.dto";
import { User, UserDocument } from "../../users/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class AdminUsersService {
  constructor(
    private usersService: UsersService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const allUsers = await this.userModel.find().exec();

    return plainToInstance(UserResponseDto, allUsers, { excludeExtraneousValues: true });
  }

  async findOneById(id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: `User ${id} successfully deleted` };
  }
}
