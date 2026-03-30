import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../services/auth.service.js";
import { User as EUSER } from "../../user/entities/user.entity.js";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "username" });
  }

  async validate(username: string, password: string): Promise<EUSER> {
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new HttpException(
        "Usuario o contraseña incorrecto, Por favor inicie sesion nuevamente.",
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
