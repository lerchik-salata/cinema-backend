import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "../auth/dto/create-user.dto";
import { HashingService } from "src/auth/hashing/hashing.service";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { UserRole } from "./enums/user-role.enum";

@Injectable()
export class UsersService {
  constructor(
    private hashingService: HashingService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.findOrCreateAdmin("admin@lab3.com", "adminpassword");
  }

  private async findOrCreateAdmin(email: string, password: string): Promise<void> {
    const existingAdmin = await this.userModel.findOne({ email }).exec();

    if (existingAdmin) {
      if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await existingAdmin.save();
      }
      return;
    }

    const passwordHash = await this.hashingService.hashPassword(password);

    const newAdmin = new this.userModel({
      email: email,
      username: "AdminUser",
      passwordHash: passwordHash,
      role: UserRole.ADMIN,
    });

    await newAdmin.save();
  }

  async create(dto: CreateUserDto, passwordHash: string): Promise<UserDocument> {
    const newUser = new this.userModel({
      email: dto.email,
      username: dto.username,
      passwordHash: passwordHash,
      role: UserRole.USER,
    });
    return newUser.save();
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException("User not found");
    }
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const newPasswordHash = await this.hashingService.hashPassword(newPassword);
    user.passwordHash = newPasswordHash;
    await user.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
