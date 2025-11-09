import { INestApplication } from "@nestjs/common";
import passport from "passport";

export function setupPassport(app: INestApplication): void {
  app.use(passport.initialize());
}
