import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { HttpLoggerService } from "../services/http-logger.service.js";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../../auth/strategies/jwt.strategy.js";

interface RequestWithUser extends Request {
  user?: {
    id?: string;
    sub?: string;
    [key: string]: unknown;
  };
}

interface ResponseWithLocals extends Response {
  locals: {
    error?: Error | { message?: string; stack?: string };
    [key: string]: unknown;
  };
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");
  private readonly methodsToLog = ["POST", "PATCH", "PUT", "DELETE"];

  constructor(
    private readonly httpLoggerService: HttpLoggerService,
    private readonly jwtService: JwtService,
  ) {}

  async use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    const req = request as RequestWithUser;
    const res = response as ResponseWithLocals;
    const method = req.method;

    if (!this.methodsToLog.includes(method)) {
      return next();
    }

    const start = Date.now();
    let logId: number;
    let capturedUserId: string | undefined;

    try {
      const authHeader = (req.headers["authorization"] ||
        req.headers["Authorization"]) as string | undefined;
      let userId: string | undefined = undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const payload = this.jwtService.verify<JwtPayload>(token);
          userId = payload.sub || payload.id || undefined;
        } catch {
          this.logger.error("Invalid token");
        }
      }

      if (!userId && req.user) {
        userId =
          (req.user.sub as string) || (req.user.id as string) || undefined;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown): Response => {
        try {
          if (body && typeof body === "object") {
            const bodyObj = body as Record<string, unknown>;
            const userObj = bodyObj.user as
              | { id?: string; sub?: string }
              | undefined;
            capturedUserId =
              userObj?.id ||
              (bodyObj.userId as string) ||
              (bodyObj.id as string) ||
              capturedUserId;
          }
        } catch {
          this.logger.error("Error capturing user id");
        }
        return originalJson(body);
      };

      logId = await this.httpLoggerService.logRequest(req, userId || "");

      res.on("finish", () => {
        void (async (): Promise<void> => {
          try {
            const { statusCode } = res;
            const contentLength = (res.get("content-length") as string) || "0";
            const responseTime = Date.now() - start;
            const isError = statusCode >= 400;

            const error = res.locals.error;
            const errorMessage =
              error instanceof Error
                ? error.message
                : (error as { message?: string })?.message ||
                  res.statusMessage ||
                  "Unknown error";
            const errorStack =
              error instanceof Error
                ? error.stack
                : (error as { stack?: string })?.stack || undefined;

            await this.httpLoggerService.updateLog(logId, {
              statusCode,
              contentLength,
              responseTime,
              isError,
              ...(capturedUserId && { user: capturedUserId }),
              ...(isError && {
                errorMessage,
                errorStack,
              }),
            });

            this.logger.log(
              `[${logId}] ${method} ${request.originalUrl} ${statusCode} ${responseTime}ms`,
            );
          } catch (error) {
            const err = error as Error;
            this.logger.error("Error updating request log:", err.message);
          }
        })();
      });

      res.on("error", (error: Error) => {
        void (async (): Promise<void> => {
          try {
            await this.httpLoggerService.updateLog(logId, {
              isError: true,
              errorMessage: error.message,
              errorStack: error.stack,
            });
          } catch (updateError) {
            const err = updateError as Error;
            this.logger.error("Error updating error log:", err.message);
          }
        })();
      });

      next();
    } catch (error) {
      const err = error as Error;
      this.logger.error("Error in HTTP logger middleware:", err.message);
      next();
    }
  }
}
