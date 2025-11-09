import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { LocalAuthGuard } from "../local-auth.guard";
import { ApiOperation, ApiBody, ApiTags } from "@nestjs/swagger";
import { ValidateUserDto } from "../dto/validate.dto";
import { User } from "@/user/entities/user.entity";
import { ConfirmPasswordResetDto, RequestPasswordResetDto } from "../dto/reset-password.dto";
import { PasswordResetService } from "../services/reset-password.service";

@ApiTags("autenticacion")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: "Iniciar sesión",
    description: "Valida credenciales y genera un token JWT.",
  })
  @ApiBody({
    description: "Credenciales de inicio de sesión",
    schema: {
      type: "object",
      properties: {
        username: { type: "string", example: "usuario@example.com" },
        password: { type: "string", example: "contraseña123" },
      },
    },
  })
  @Post("login")
  login(@Request() req: { user: User }): { access_token: string; user: any } {
    return this.authService.login(req.user);
  }

  @ApiOperation({
    summary: "Validar si un usuario o correo ya existe",
    description: "Recibe `{ username?, email? }` y responde `{ usernameExists?, emailExists? }`",
  })
  @ApiBody({ type: ValidateUserDto })
  @Post()
  async validateUser(
    @Body() body: ValidateUserDto,
  ): Promise<{ usernameExists?: boolean; emailExists?: boolean }> {
    const { username, email } = body;

    const usernameExists = username ? await this.authService.validateUsername(username) : undefined;
    const emailExists = email ? await this.authService.validateEmail(email) : undefined;

    return { usernameExists, emailExists };
  }

  @Post("request-password-reset")
  async requestReset(@Body() dto: RequestPasswordResetDto): Promise<{ message: string }> {
    await this.passwordResetService.requestPasswordReset(dto.email);
    return { message: "Si existe una cuenta asociada, se envió un código al correo." };
  }

  @Post("confirm-password-reset")
  async confirmReset(@Body() dto: ConfirmPasswordResetDto): Promise<{ message: string }> {
    await this.passwordResetService.confirmPasswordReset(dto.email, dto.code, dto.newPassword);
    return { message: "Contraseña actualizada correctamente." };
  }
}
