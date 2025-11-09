import { IsNumber, IsOptional, IsString, validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ValidationError } from "@nestjs/common";

export class EnvironmentVariables {
  // Core
  @IsString()
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  APP_HOST: string;

  @IsString()
  GITHUB_WEBHOOK_SECRET: string;

  @IsString()
  GITHUB_SCRIPT_BACKEND: string;

  @IsString()
  GITHUB_SCRIPT_FRONTEND: string;

  @IsString()
  GITHUB_SCRIPT_WEB: string;

  // Swagger
  @IsString()
  SWAGGER_USER: string;

  @IsString()
  SWAGGER_PASSWORD: string;

  // Database
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  DB_USERNAME: string;

  @IsOptional()
  @IsString()
  DB_PASSWORD?: string;

  // JWT
  @IsString()
  JWT_SECRET_KEY: string;


}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((err: ValidationError) => {
        const constraints = err.constraints
          ? Object.values(err.constraints).join(", ")
          : "valor inválido";
        return `${err.property}: ${constraints}`;
      })
      .join("\n");

    throw new Error(`Configuración inválida en el archivo .env:\n${messages}`);
  }

  return validatedConfig;
}
