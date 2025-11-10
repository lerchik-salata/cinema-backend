import { Controller, UseGuards, Get, Delete, Put, Param, Body, ParseIntPipe } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/users/enums/user-role.enum";
import { UpdatePostDto } from "src/forums/dto/update-post.dto";
import { AdminForumsService } from "./forums.service";
import { ApiSecurity } from "@nestjs/swagger";

@ApiSecurity("bearer")
@Controller("admin/forums")
@UseGuards(JwtAuthGuard)
export class AdminForumsController {
  constructor(private adminForumsService: AdminForumsService) {}

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Get("posts")
  getAllPosts() {
    return this.adminForumsService.getAllPosts();
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Put("posts/:id")
  updatePost(@Param("id", ParseIntPipe) postId: number, @Body() updatePostDto: UpdatePostDto) {
    return this.adminForumsService.updatePost(postId, updatePostDto);
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Delete("posts/:id")
  deletePost(@Param("id", ParseIntPipe) postId: number) {
    return this.adminForumsService.deletePost(postId);
  }
}
