import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpLog } from "../entities/http_logs.entity";
import { HttpLogFilterDto } from "../dto/api.dto";

@Injectable()
export class HttpLoggerService {
  constructor(
    @InjectRepository(HttpLog)
    private readonly httpLogRepository: Repository<HttpLog>,
  ) {}

  async logRequest(request: any, userId: string): Promise<number> {
    const { method, originalUrl, body, query, params, headers } = request;

    const log = this.httpLogRepository.create({
      method: method as string,
      url: originalUrl as string,
      body: this.sanitizeBody(body),
      query: query || {},
      params: params || {},
      ip: this.getClientIp(request) || "",
      userAgent: headers?.["user-agent"] || "",
      user: userId,
    });

    const savedLog = await this.httpLogRepository.save(log);
    return savedLog.id;
  }

  async updateLog(logId: number, update: Partial<HttpLog>): Promise<HttpLog | null> {
    await this.httpLogRepository.update(logId, update);
    return this.httpLogRepository.findOneBy({ id: logId });
  }

  async getLogs(query: HttpLogFilterDto): Promise<any> {
    const page: number = (query.page as number);
    const limit: number = (query.limit as number);
    const qb = this.httpLogRepository.createQueryBuilder("log");
    if (query.fechaDesde) {
      qb.andWhere("log.createdAt >= :fechaDesde", { fechaDesde: query.fechaDesde });
    }
    if (query.fechaHasta) {
      qb.andWhere("log.createdAt <= :fechaHasta", { fechaHasta: query.fechaHasta });
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

  private sanitizeBody(body: any): Promise<void> {
    if (!body) return body;
    const sanitized = { ...body };

    ["password", "token", "accessToken", "refreshToken"].forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "***REDACTED***";
      }
    });

    return sanitized;
  }

  private getClientIp(request: any): string {
    return (
      request.headers["x-forwarded-for"] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.connection?.socket?.remoteAddress ||
      ""
    );
  }
}
