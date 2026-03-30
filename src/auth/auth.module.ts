import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "./services/auth.service.js";
import { LocalStrategy } from "./strategies/local.strategy.js";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./controllers/auth.controller.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PasswordResetService } from "./services/reset-password.service.js";
import { UserService } from "@/user/services/user.service";
import { PasswordResetToken } from "./entities/password-reset.entity.js";
import { User } from "@/user/entities/user.entity";
import { UserRepository } from "@/user/repositories/user.repository";

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([PasswordResetToken, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET_KEY"),
        signOptions: { expiresIn: "8h" },
      }),
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    PasswordResetService,
    UserService,
    UserRepository,
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
