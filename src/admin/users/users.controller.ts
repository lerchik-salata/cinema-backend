import {
  Controller,
  Get,
  UseGuards,
  Param,
  Delete,
  NotFoundException,
  Put,
  Body,
} from "@nestjs/common";
import { UsersService, UserRole } from "src/users/user.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "src/users/dto/user.dto";

@Controller("admin/users")
@UseGuards(JwtAuthGuard)
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Get()
  async findAll() {
    await Promise.resolve();
    const allUsers = this.usersService["users"].map((user) => {
      const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
      return safeUser;
    });
    return allUsers;
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Get(":id")
  async findOne(@Param("id") id: string) {
    await Promise.resolve();
    const user = this.usersService["users"].find((u) => u._id === id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    return safeUser;
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Put(":id")
  async updateUser(@Param("id") id: string, @Body() updateUserDto: Partial<UserResponseDto>) {
    await Promise.resolve();
    const user = this.usersService["users"].find((u) => u._id === id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    Object.assign(user, updateUserDto);
    const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    return safeUser;
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Delete(":id")
  async deleteUser(@Param("id") id: string) {
    await Promise.resolve();
    const userIndex = this.usersService["users"].findIndex((u) => u._id === id);
    if (userIndex === -1) {
      throw new NotFoundException("User not found");
    }
    this.usersService["users"].splice(userIndex, 1);
    return { message: `User ${id} successfully deleted` };
  }
}
