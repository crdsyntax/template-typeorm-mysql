import { envMode } from "@/main";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export function setupCors(app: INestApplication, configService: ConfigService): void {
  const allowedOrigins =
    configService.get<string>("NODE_ENV") === (envMode.PROD as string)
      ? [configService.get<string>("APP_HOST") || ""]
      : "*";

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS no permitido para origen: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    credentials: true,
  });
}
