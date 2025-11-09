import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "@/user/services/user.service";
import * as bcrypt from "bcrypt";
import { EUSER } from "@/common/modules/global.module";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  private async comparePassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!plainTextPassword || !hashedPassword) return false;
    try {
      return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch {
      return false;
    }
  }

  async validateUser(username: string, password: string): Promise<EUSER | null> {
    const user = await this.usersService.findOneByEmail(username);

    if (!user) return null;

    const isMatch = await this.comparePassword(password, user.hash);
    return isMatch ? user : null;
  }

  login(user: EUSER): { access_token: string; user: Partial<EUSER> } {
    const payload = {
      sub: user.id,
      username: user.email,
    };

    const expiresIn = `4h`;

    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      user: user,
    };
  }

  async validateUsername(username: string): Promise<boolean> {
    if (!username) return false;
    const user = await this.usersService.findOneByEmail(username);
    return !!user;
  }

  async validateEmail(email?: string): Promise<boolean> {
    if (!email) return false;
    const user = await this.usersService.findOneByEmail(email);
    return !!user;
  }
}
