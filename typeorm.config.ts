import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

config();

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? "3306"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, "src/**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "src/migrations/*{.ts,.js}")],
  migrationsTableName: "migrations",
  synchronize: false,
});
