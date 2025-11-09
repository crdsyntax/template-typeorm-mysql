import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "user_felizviaje",
  pass: process.env.DB_PASS || "",
  name: process.env.DB_NAME || "db_dev_felizviaje",
}));
