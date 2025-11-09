import { INestApplication, ValidationPipe } from "@nestjs/common";

export function setupGlobalValidation(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );
}
