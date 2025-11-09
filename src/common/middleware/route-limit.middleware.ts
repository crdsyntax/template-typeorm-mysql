import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
    message: {
      statusCode: 429,
      error: "Demasiadas peticiones. Intenta más tarde.",
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    return this.limiter(req, res, next);
  }
}

export const likeRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: "Demasiados likes, intenta más tarde.",
});
