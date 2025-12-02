import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "./services/auth.service";
import { LocalStrategy } from "./local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./controllers/auth.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PasswordResetService } from "./services/reset-password.service";
import { UserService } from "@/user/services/user.service";
import { PasswordResetToken } from "./entities/password-reset.entity";
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
    UserRepository
  ],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
