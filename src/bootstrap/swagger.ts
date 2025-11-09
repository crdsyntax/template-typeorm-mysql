import { INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("FelizViaje Services – Documentación.")
    .setDescription("Versión 19.1.0 - test signature read by app.controller")
    .setVersion("19.1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Ingrese el token de autenticación JWT",
        in: "header",
      },
      "access-token",
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("api/doc", app, document, {
    swaggerOptions: {
      docExpansion: "none",
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });
}
