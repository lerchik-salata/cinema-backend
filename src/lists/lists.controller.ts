import { Controller, Post, Body, Get, Delete, Req, UseGuards, Param } from "@nestjs/common";
import { ListsService } from "./lists.service";
import { AddToListDto } from "./dto/add-to-list.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request } from "express";
import { ApiSecurity } from "@nestjs/swagger";

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@ApiSecurity("bearer")
@Controller("lists")
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async addToList(@Body() addToListDto: AddToListDto, @Req() req: RequestWithUser) {
    const userId = req.user.userId;

    return await this.listsService.addToList(userId, addToListDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get("my")
  async getMyLists(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return await this.listsService.getMyLists(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(":movieId")
  async removeFromList(@Param("movieId") movieId: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return await this.listsService.removeFromList(userId, movieId);
  }
}
