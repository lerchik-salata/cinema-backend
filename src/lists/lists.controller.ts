import { Controller, Post, Body, Get, Delete, Req, UseGuards, Param } from "@nestjs/common";
import { ListsService } from "./lists.service";
import { AddToListDto } from "./dto/add-to-list.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Request } from "express";

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller("lists")
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  addToList(@Body() addToListDto: AddToListDto, @Req() req: RequestWithUser) {
    const userId = req.user.userId;

    return this.listsService.addToList(userId, addToListDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get("my")
  getMyLists(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.listsService.getMyLists(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(":movieId")
  removeFromList(@Param("movieId") movieId: string, @Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.listsService.removeFromList(userId, movieId);
  }
}
