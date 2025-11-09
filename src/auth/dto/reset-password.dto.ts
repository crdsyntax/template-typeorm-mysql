import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class RequestPasswordResetDto {
  @ApiProperty({ description: "Correo de usuario", type: String, required: true })
  @IsEmail({}, { message: "Coloque un correo valido. " })
  email: string;
}

export class ConfirmPasswordResetDto {
  @ApiProperty({ description: "Correo de usuario", type: String, required: true })
  @IsEmail({}, { message: "Coloque un correo valido. " })
  email: string;

  @ApiProperty({ description: "Codigo de validacion de usuario", type: String, required: true })
  @IsString({ message: "Coloque el codigo valido. " })
  code: string;

  @ApiProperty({ description: "Clave nueva de usuario", type: String, required: true })
  @IsString({ message: "Coloque la nueva clave de usuario. " })
  newPassword: string;
}
