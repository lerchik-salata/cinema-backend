import { Controller, UseGuards, Get, Delete, Patch, Param, Body } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UserRole } from "../../users/enums/user-role.enum";
import { UpdatePostDto } from "../../forums/dto/update-post.dto";
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
  @Patch("posts/:id")
  updatePost(@Param("id") postId: string, @Body() updatePostDto: UpdatePostDto) {
    return this.adminForumsService.updatePost(postId, updatePostDto);
  }

  @UseGuards(RolesGuard(UserRole.ADMIN))
  @Delete("posts/:id")
  deletePost(@Param("id") postId: string) {
    return this.adminForumsService.deletePost(postId);
  }
}
