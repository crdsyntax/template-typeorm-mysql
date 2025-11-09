import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { validate } from "./config/env.validation";
import { AuthModule } from "./auth/auth.module";
import { GlobalServicesModule } from "./common/modules/global.module";
import { CommonModule } from "./common/common.module";
import { AppService } from "./app.service";
import { AppController, StatusController } from "./app.controller";
import { HttpLog } from "./common/entities/http_logs.entity";
import { BasicAuthGuard } from "./common/guards/basic-auth.guard";
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      validate,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_DATABASE"),
        cache: true,
        entities: [`${__dirname}/**/*.entity{.ts,.js}`, `${__dirname}/**/*.view{.ts,.js}`],
        subscribers: [`${__dirname}/**/*.subscriber{.ts,.js}`],
        synchronize: configService.get<string>("NODE_ENV") === "local",
      }),
    }),
    TypeOrmModule.forFeature([HttpLog]),
    AuthModule,
    UserModule,
    GlobalServicesModule,
    CommonModule,
    UserModule,
  ],
  controllers: [AppController, StatusController],
  providers: [AppService, BasicAuthGuard],
  exports: [],
})
export class AppModule {}
