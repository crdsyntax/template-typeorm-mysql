import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { HttpLoggerMiddleware } from "./middleware/http-logger.middleware";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpLog } from "./entities/http_logs.entity";
import { HttpLoggerService } from "./services/http-logger.service";
import { RateLimitMiddleware } from "./middleware/route-limit.middleware";
import { AuthModule } from "../auth/auth.module";
import { HttpLogsController } from "./controllers/http-logs.controller";
import { VersionEntity } from "./entities/version.entity";
import { VersionService } from "./services/version.service";
import { VersionCheckerController } from "./controllers/version-checker.controller";

@Module({
  imports: [TypeOrmModule.forFeature([HttpLog, VersionEntity]), AuthModule],
  exports: [HttpLoggerService, VersionService],
  providers: [HttpLoggerService, VersionService],
  controllers: [HttpLogsController, VersionCheckerController],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware, RateLimitMiddleware).forRoutes("*");
  }
}
