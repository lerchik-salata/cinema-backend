import { Injectable, NotFoundException } from "@nestjs/common";
import { AddToListDto } from "./dto/add-to-list.dto";
import { InjectModel } from "@nestjs/mongoose"; // 1. Імпорт
import { Model } from "mongoose";
import { ListItem, ListItemDocument } from "./schemas/list-item.schema"; // 2. Імпорт схеми

@Injectable()
export class ListsService {
  constructor(
    @InjectModel(ListItem.name)
    private listItemModel: Model<ListItemDocument>,
  ) {}
  async addToList(userId: string, dto: AddToListDto): Promise<ListItem> {
    const updatedItem = await this.listItemModel
      .findOneAndUpdate(
        { userId: userId, movieId: dto.movieId },
        { listType: dto.listType },
        {
          new: true,
          upsert: true,
        },
      )
      .exec();

    return updatedItem;
  }
  async getMyLists(userId: string): Promise<ListItem[]> {
    return this.listItemModel.find({ userId: userId }).exec();
  }

  async removeFromList(userId: string, movieId: string): Promise<{ message: string }> {
    const result = await this.listItemModel
      .findOneAndDelete({
        userId: userId,
        movieId: movieId,
      })
      .exec();

    if (!result) {
      throw new NotFoundException("List item not found");
    }

    return { message: "Item removed" };
  }
}
