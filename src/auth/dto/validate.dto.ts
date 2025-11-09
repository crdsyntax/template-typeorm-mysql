import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ValidateUserDto {
  @ApiPropertyOptional({
    description: "Nombre de usuario a validar",
    required: false,
    example: "usuario1",
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: "Correo a validar",
    required: false,
    example: "usuario@example.com",
  })
  @IsOptional()
  @IsString()
  email?: string;
}
