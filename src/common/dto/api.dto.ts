import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsUUID, IsDateString, IsString, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @ApiProperty({
    required: false,
    description: "Número de página para la paginación",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    required: false,
    description: "Número de elementos por página para la paginación",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class UpdateGenericDto {
  @ApiProperty({ example: "id", description: "ID" })
  id: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export class SuccessResponseDto {
  @ApiProperty({ type: "boolean" })
  success!: boolean;
}

export class HttpLogFilterDto {
  @ApiPropertyOptional({ description: "Fecha desde", example: "2025-01-01" })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: "Fecha hasta", example: "2025-02-01" })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({ description: "Usuario que ejecutó la petición" })
  @IsOptional()
  @IsString()
  user?: string;

  @ApiPropertyOptional({ description: "Método HTTP" })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: "Página", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "Resultados por página", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
