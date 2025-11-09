import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET_KEY,
  sub: process.env.JWT_SUB,
  username: process.env.JWT_USERNAME,
  password: process.env.JWT_PASSWORD,
}));
