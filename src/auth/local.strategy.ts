import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./services/auth.service";
import { EUSER } from "@/common/modules/global.module";

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
        HttpStatus.UNAUTHORIZED
      );
    }
    return user;
  }
}
