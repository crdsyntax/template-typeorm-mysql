import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo User' })
  @ApiResponse({ status: 201, description: 'Entidad creada', type: User })
  create(@Body() createDto: CreateUserDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las entidades User' })
  @ApiResponse({ status: 200, description: 'Listado de entidades', type: [User] })
  @ApiQuery({ name: 'page', type: Number, description: 'Numero de paginacion.'})
  @ApiQuery({ name: 'limit', type: Number, description: 'Limite de paginacion.'})
  findAll(@Query("page", ParseIntPipe) page = 1, @Query("limit", ParseIntPipe) limit = 10) {
    return this.service.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener User por id' })
  @ApiResponse({ status: 200, description: 'Entidad encontrada', type: User })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar User por id' })
  @ApiResponse({ status: 200, description: 'Entidad actualizada', type: User })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateUserDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar User por id' })
  @ApiResponse({ status: 200, description: 'Entidad eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
