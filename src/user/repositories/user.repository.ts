import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(createDto: CreateUserDto): Promise<User> {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
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

  findOneBy(params: Partial<User>): Promise<User | null> {
    return this.repo.findOneBy(params);
  }

  findOne(id: number): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  async update(id: number, updateDto: UpdateUserDto): Promise<User | null> {
    await this.repo.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
