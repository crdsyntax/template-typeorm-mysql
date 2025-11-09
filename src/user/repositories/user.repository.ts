import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  create(createDto: CreateUserDto) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.repo.findAndCount({ skip, take: limit });
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOneBy(params: Partial<User>) {
    return this.repo.findOneBy(params);
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, updateDto: UpdateUserDto) {
    return this.repo.update(id, updateDto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
