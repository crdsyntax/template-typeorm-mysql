import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsArray, IsEnum } from "class-validator";
import { VersionStatus, VersionType } from "../entities/version.entity";

export class CreateVersionDto {
  @ApiProperty({ description: "Título de la versión", maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Descripción de la versión", maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Tickets relacionados", type: [String] })
  @IsArray()
  @IsString({ each: true })
  tickets: string[];

  @ApiProperty({ description: "Tipo de versión", enum: VersionType })
  @IsEnum(VersionType)
  type: VersionType;

  @ApiProperty({ description: "Encargado de la versión", maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty({ description: "Número de versión", maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: "Estado de la versión", enum: VersionStatus })
  @IsEnum(VersionStatus)
  status: VersionStatus;
}
