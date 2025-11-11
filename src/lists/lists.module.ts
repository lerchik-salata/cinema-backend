import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ListsController } from "./lists.controller";
import { ListsService } from "./lists.service";
import { ListItem, ListItemSchema } from "./schemas/list-item.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: ListItem.name, schema: ListItemSchema }])],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}
