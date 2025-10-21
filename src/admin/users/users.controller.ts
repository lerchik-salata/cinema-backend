import { Controller, Get, UseGuards, Param, Delete, Put, Body } from "@nestjs/common";
import { UserRole } from "src/users/user.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { AdminUsersService } from "./users.service";
import { UserResponseDto } from "src/users/dto/user.dto";

@Controller("admin/users")
@UseGuards(JwtAuthGuard)
export class AdminUsersController {
  constructor(private adminUsersService: AdminUsersService) {}

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Get()
  async findAll() {
    return this.adminUsersService.findAll();
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.adminUsersService.findOneById(id);
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Put(":id")
  async updateUser(@Param("id") id: string, @Body() updateUserDto: Partial<UserResponseDto>) {
    return this.adminUsersService.update(id, updateUserDto);
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Delete(":id")
  async deleteUser(@Param("id") id: string) {
    return this.adminUsersService.delete(id);
  }
}
