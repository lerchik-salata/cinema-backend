import {
  Controller,
  Get,
  UseGuards,
  Request,
  NotFoundException,
  Put,
  Patch,
  Body,
  Delete,
} from "@nestjs/common";
import { UsersService } from "./user.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "../auth/auth.interface";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "./dto/user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ApiSecurity } from "@nestjs/swagger";

@ApiSecurity("bearer")
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findOneById(req.user.userId);

    if (!user) {
      throw new NotFoundException("User profile not found");
    }

    const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateProfile(@Request() req: AuthenticatedRequest, @Body() updateDto: UpdateUserDto) {
    const userId = req.user.userId;
    const updatedUser = await this.usersService.update(userId, updateDto);

    const safeUser = plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Delete("me")
  async deleteProfile(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    await this.usersService.remove(userId);
    return { message: "User profile deleted successfully." };
  }

  @UseGuards(JwtAuthGuard)
  @Put("me/password")
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.userId;
    await this.usersService.changePassword(userId, changePasswordDto.newPassword);

    return { message: "Password changed successfully." };
  }
}
