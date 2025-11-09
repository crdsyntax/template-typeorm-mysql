import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { HttpLoggerService } from "../services/http-logger.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");
  private readonly methodsToLog = ["POST", "PATCH", "PUT", "DELETE"];

  constructor(
    private readonly httpLoggerService: HttpLoggerService,
    private readonly jwtService: JwtService,
  ) {}

  async use(request: Request, response: Response, next: NextFunction): Promise<void> {
    const method = request.method;

    if (!this.methodsToLog.includes(method)) {
      return next();
    }

    const start = Date.now();
    let logId: number;
    let capturedUserId: string | undefined;

    try {
      const authHeader = (request.headers?.["authorization"] ||
        request.headers?.["Authorization"]) as string | undefined;
      let userId: string | undefined = undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const payload: any = this.jwtService.verify(token);
          userId = payload?.sub || payload?.id || undefined;
        } catch {
          this.logger.error("Invalid token");
        }
      }

      if (!userId) {
        const reqUser: any = (request as any).user;
        userId = reqUser?.sub || reqUser?.id || undefined;
      }

      const originalJson = response.json.bind(response);
      (response as any).json = (body: any) => {
        try {
          capturedUserId = body?.user?.id || body?.userId || body?.id || capturedUserId;
        } catch {
          this.logger.error("Error capturing user id");
        }
        return originalJson(body);
      };

      logId = await this.httpLoggerService.logRequest(request, userId || "");

      response.on("finish", async () => {
        try {
          const { statusCode } = response;
          const contentLength = response.get("content-length") || "0";
          const responseTime = Date.now() - start;
          const isError = statusCode >= 400;

          const error = response.locals?.error;
          const errorMessage = error?.message || response.statusMessage || "Unknown error";
          const errorStack = error?.stack || null;

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
          this.logger.error("Error updating request log:", error);
        }
      });

      response.on("error", async (error) => {
        try {
          await this.httpLoggerService.updateLog(logId, {
            isError: true,
            errorMessage: error.message,
            errorStack: error.stack,
          });
        } catch (updateError) {
          this.logger.error("Error updating error log:", updateError);
        }
      });

      next();
    } catch (error) {
      this.logger.error("Error in HTTP logger middleware:", error);
      next();
    }
  }
}
