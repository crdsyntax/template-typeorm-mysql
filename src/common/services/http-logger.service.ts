import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpLog } from "../entities/http_logs.entity.js";
import { HttpLogFilterDto } from "../dto/api.dto.js";
import { Request } from "express";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

type ExpressRequest = Request<
  ParamsDictionary,
  unknown,
  Record<string, unknown>,
  ParsedQs
>;

@Injectable()
export class HttpLoggerService {
  constructor(
    @InjectRepository(HttpLog)
    private readonly httpLogRepository: Repository<HttpLog>,
  ) {}

  async logRequest(request: ExpressRequest, userId: string): Promise<number> {
    const { method, originalUrl, body, query, params, headers } = request;
    const bodyTyped = body;
    const queryTyped = query;
    const paramsTyped = params;

    const log = this.httpLogRepository.create({
      method: method,
      url: originalUrl,
      body: this.sanitizeBody(bodyTyped) ?? {},
      query: queryTyped || {},
      params: paramsTyped || {},
      ip: this.getClientIp(request) || "",
      userAgent: (headers["user-agent"] as string) || "",
      user: userId,
    });

    const savedLog = await this.httpLogRepository.save(log);
    return savedLog.id;
  }

  async updateLog(
    logId: number,
    update: Partial<HttpLog>,
  ): Promise<HttpLog | null> {
    await this.httpLogRepository.update(
      logId,
      update as unknown as QueryDeepPartialEntity<HttpLog>,
    );
    return this.httpLogRepository.findOneBy({ id: logId });
  }

  async getLogs(query: HttpLogFilterDto): Promise<{
    data: HttpLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page: number = query.page as number;
    const limit: number = query.limit as number;
    const qb = this.httpLogRepository.createQueryBuilder("log");
    if (query.fechaDesde) {
      qb.andWhere("log.createdAt >= :fechaDesde", {
        fechaDesde: query.fechaDesde,
      });
    }
    if (query.fechaHasta) {
      qb.andWhere("log.createdAt <= :fechaHasta", {
        fechaHasta: query.fechaHasta,
      });
    }
    if (query.user) {
      qb.andWhere("log.user = :user", { user: query.user });
    }
    if (query.method) {
      qb.andWhere("log.method = :method", { method: query.method });
    }
    qb.orderBy("log.createdAt", "DESC");
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: page, limit: limit };
  }

  private sanitizeBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== "object") return undefined;
    const sanitized = { ...(body as Record<string, unknown>) };

    ["password", "token", "accessToken", "refreshToken"].forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "***REDACTED***";
      }
    });

    return sanitized;
  }

  private getClientIp(request: Request): string {
    const xForwardedFor = request.headers["x-forwarded-for"];
    if (typeof xForwardedFor === "string") {
      return xForwardedFor.split(",")[0].trim();
    }
    if (Array.isArray(xForwardedFor)) {
      return xForwardedFor[0].trim();
    }
    return request.socket.remoteAddress || "";
  }
}
