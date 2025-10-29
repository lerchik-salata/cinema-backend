import { Injectable, NotFoundException } from "@nestjs/common";
import { AddToListDto } from "./dto/add-to-list.dto";

export interface ListItem {
  id: number;
  userId: string;
  movieId: string;
  listType: string;
}

@Injectable()
export class ListsService {
  private userLists: ListItem[] = [];
  private nextId = 1;

  addToList(userId: string, dto: AddToListDto) {
    const existingItem = this.userLists.find(
      (item) => item.userId === userId && item.movieId === dto.movieId,
    );

    if (existingItem) {
      existingItem.listType = dto.listType;
      return existingItem;
    }

    const newItem: ListItem = {
      id: this.nextId++,
      userId: userId,
      movieId: dto.movieId,
      listType: dto.listType,
    };
    this.userLists.push(newItem);

    // console.log(this.userLists);
    return newItem;
  }

  getMyLists(userId: string) {
    return this.userLists.filter((item) => item.userId === userId);
  }

  removeFromList(userId: string, movieId: string) {
    const itemIndex = this.userLists.findIndex(
      (item) => item.userId === userId && item.movieId === movieId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException("List item not found");
    }

    this.userLists.splice(itemIndex, 1);
    return { message: "Item removed" };
  }
}
