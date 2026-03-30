import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { join } from "path";
import express from "express";
import { ConfigService } from "@nestjs/config";
import {
  ClassSerializerInterceptor,
  Logger,
  INestApplication,
} from "@nestjs/common";
import { setupGlobalValidation } from "./bootstrap/validation";
import { setupCors } from "./bootstrap/cors";
import { setupPassport } from "./bootstrap/passport";
import basicAuth from "express-basic-auth";
import { GlobalExceptionFilter } from "./common/filters/globalCatch.filter";
import { setupSwagger } from "./bootstrap/swagger";
const logger = new Logger("Bootstrap");

export enum envMode {
  DEV = "DEVELOPMENT",
  PROD = "PRODUCTION",
}

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  const configService = app.get(ConfigService);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use("/uploads", express.static(join(__dirname, "..", "uploads")));

  app.use(
    "/github-webhook",
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  setupGlobalValidation(app);
  setupCors(app, configService);
  setupPassport(app);

  if (configService.get<string>("NODE_ENV") === (envMode.DEV as string)) {
    app.use(
      ["api/doc", "/docs-json"],
      basicAuth({
        challenge: true,
        users: {
          [configService.get<string>("SWAGGER_USER") || ""]:
            configService.get<string>("SWAGGER_PASSWORD") || "",
        },
      }),
    );

    setupSwagger(app);
    logger.debug(`🚀 swagger cargado.`);
  }

  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.startAllMicroservices();
  await app.listen(configService.get<number>("PORT") || "");

  logger.log(`🚀 Servicio en puerto: ${configService.get<number>("PORT")}`);
}

bootstrap().catch((err) => {
  logger.error("🔥 Error fatal al iniciar la app:");
  logger.error(err);
  process.exit(1);
});
