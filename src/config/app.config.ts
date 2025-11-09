import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  env: process.env.NODE_ENV || "dev",
  port: parseInt(process.env.PORT || "3000", 10),
  debug: process.env.DEBUG === "true",
  appHost: process.env.APP_HOST || "http://localhost:3000",
}));
