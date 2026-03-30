import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly BCRYPT_SALT_ROUNDS = 10;
  constructor(private readonly repository: UserRepository) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      if (page < 1 || limit < 1) {
        throw new HttpException("Parámetros inválidos", HttpStatus.BAD_REQUEST);
      }
      return await this.repository.findAll(page, limit);
    } catch (error) {
      const err = error as Error;
      this.logger.error(err.message);
      throw new HttpException(
        "Error al obtener registros",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const item = await this.repository.findOne(id);
      if (!item)
        throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return item;
    } catch (error) {
      const err = error as Error;
      this.logger.error(err.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Error al obtener el registro",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const item = await this.repository.findOneBy({ email });
      if (!item)
        throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return item;
    } catch (error) {
      const err = error as Error;
      this.logger.error(err.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Error al obtener el registro",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.repository.create(data);
    } catch (error) {
      const err = error as Error;
      this.logger.error(err.message);
      throw new HttpException(
        "Error al crear el registro",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    try {
      const updated = await this.repository.update(id, data);
      if (!updated)
        throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return updated;
    } catch (error) {
      const err = error as Error;
      this.logger.error(err.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Error al actualizar",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const deleted = await this.repository.remove(id);
      if (!deleted)
        throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return deleted;
    } catch (error) {
      const err = error as Error;
      this.logger.error(err.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Error al eliminar",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    try {
      const hash = await bcrypt.hash(newPassword, this.BCRYPT_SALT_ROUNDS);

      const updated = await this.repository.update(id, {
        hash,
      });
      if (!updated)
        throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return true;
    } catch (error) {
      const err = error as Error;
      this.logger.error(err.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Error al actualizar",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
