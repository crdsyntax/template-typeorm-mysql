import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import * as bcrypt from "bcrypt";
/* import { MailerService } from "@nestjs-modules/mailer"; */
import { randomInt } from "crypto";
import { PasswordResetToken } from "../entities/password-reset.entity";
import { UserService } from "@/user/services/user.service";

@Injectable()
export class PasswordResetService {
  private CODE_TTL_MINUTES = 10;
  private CODE_DIGITS = 6;
  private BCRYPT_SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    private readonly usersService: UserService,
    /*     private readonly mailerService: MailerService, */
  ) {}

  private generateNumericCode(): string {
    const min = 0;
    const max = 10 ** this.CODE_DIGITS - 1;
    const n = randomInt(min, max + 1);
    return n.toString().padStart(this.CODE_DIGITS, "0");
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return;
    }

    const code = this.generateNumericCode();
    const codeHash = await bcrypt.hash(code, this.BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + this.CODE_TTL_MINUTES * 60 * 1000);

    await this.tokenRepo.update({ userId: Number(user.id), used: false }, { used: true });

    const tokenEntity = this.tokenRepo.create({
      user,
      userId: Number(user.id),
      codeHash,
      expiresAt,
      used: false,
    });

    await this.tokenRepo.save(tokenEntity);

    await this.sendCodeEmail(user.email, code, expiresAt);
  }

  private async sendCodeEmail(to: string, code: string, expiresAt: Date): Promise<void> {
    /*     const subject = "Código para recuperar contraseña";
    const text = `Tu código para recuperar la contraseña es: ${code}\n\nEl código expira a las ${expiresAt.toLocaleString()}. Si no solicitaste este código, ignora este mensaje.`;
    await this.mailerService.sendMail({
      to,
      subject,
      text,
      html: `<p>Tu código para recuperar la contraseña es:</p>
             <h2>${code}</h2>
             <p>Expira: ${expiresAt.toLocaleString()}</p>
             <p>Si no solicitaste este código, ignora este mensaje.</p>`,
    }); */
  }

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const token = await this.tokenRepo.findOne({
      where: { userId: Number(user.id), used: false },
      order: { createdAt: "DESC" },
    });

    if (!token) {
      throw new BadRequestException("No hay un código válido para este usuario");
    }

    if (token.expiresAt.getTime() < Date.now()) {
      token.used = true;
      await this.tokenRepo.save(token);
      throw new BadRequestException("El código expiró");
    }

    const isMatch = await bcrypt.compare(code, token.codeHash);
    if (!isMatch) {
      throw new BadRequestException("Código inválido");
    }

    /* await this.usersService.updatePassword(user.id, newPassword); */

    token.used = true;
    await this.tokenRepo.save(token);

    /*     await this.mailerService.sendMail({
      to: user.correo,
      subject: "Contraseña cambiada",
      text: "Tu contraseña ha sido actualizada correctamente. Si no fuiste tú, contacta soporte.",
    }); */
  }
}
