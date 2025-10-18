import { Controller, Get, UseGuards, Request, NotFoundException } from "@nestjs/common";
import { UsersService } from "./user.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import type { AuthenticatedRequest } from "src/auth/auth.interface";

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

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      message: "This is protected information obtained using a JWT token.",
    };
  }
}
