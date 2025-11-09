import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly repository: UserRepository) {}

  async findAll(page = 1, limit = 10) {
    try {
      if (page < 1 || limit < 1) {
        throw new HttpException("Parámetros inválidos", HttpStatus.BAD_REQUEST);
      }
      return await this.repository.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException("Error al obtener registros", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number) {
    try {
      const item = await this.repository.findOne(id);
      if (!item) throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return item;
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException("Error al obtener el registro", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneByEmail(email: string) {
    try {
      const item = await this.repository.findOneBy({ email });
      if (!item) throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return item;
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException("Error al obtener el registro", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(data: CreateUserDto) {
    try {
      return await this.repository.create(data);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException("Error al crear el registro", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateUserDto) {
    try {
      const updated = await this.repository.update(id, data);
      if (!updated) throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return updated;
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException("Error al actualizar", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: number) {
    try {
      const deleted = await this.repository.remove(id);
      if (!deleted) throw new HttpException("User no encontrado", HttpStatus.NOT_FOUND);
      return deleted;
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException("Error al eliminar", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
