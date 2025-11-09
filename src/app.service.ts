import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { exec } from "child_process";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpLog } from "./common/entities/http_logs.entity";

export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

export interface GithubPushPayload {
  ref: string;
  before: string;
  after: string;
  repository: GithubRepository;
  pusher: { name: string; email: string };
  sender: { login: string };
}

export interface WebhookResponse {
  status: number;
  message: string;
}

export interface RecentErrorLog {
  id: number;
  method: string;
  url: string;
  statusCode: number;
  user: string;
  ip: string;
  userAgent: string;
  errorMessage?: string;
  createdAt: Date;
}

export interface DashboardResponse {
  status: { ok: boolean; timestamp: string };
  services: { database: { ok: boolean; latencyMs: number | null } };
  general: {
    pid: number;
    nodeVersion: string;
    platform: NodeJS.Platform;
    env: string | undefined;
    startedAt: string;
    uptimeSeconds: number;
    memory: { rss: number; heapTotal: number; heapUsed: number; external: number };
  };
  recentErrors: RecentErrorLog[];
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly secret: string;
  private readonly backendScript: string;
  private readonly frontendScript: string;
  private readonly webScript: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(HttpLog)
    private readonly httpLogRepository: Repository<HttpLog>,
  ) {
    this.secret = this.configService.get<string>("GITHUB_WEBHOOK_SECRET") || "";
    this.backendScript = this.configService.get<string>("GITHUB_SCRIPT_BACKEND") || "";
    this.frontendScript = this.configService.get<string>("GITHUB_SCRIPT_FRONTEND") || "";
    this.webScript = this.configService.get<string>("GITHUB_SCRIPT_WEB") || "";
  }

  verifySignature(payload: unknown, signature: string): boolean {
    if (!signature) return false;

    const sig = String(signature).trim();
    const sigHex = sig.startsWith("sha256=") ? sig.slice("sha256=".length) : sig;

    let data: Buffer | string | undefined;
    if (Buffer.isBuffer(payload)) {
      data = payload as Buffer;
    } else if (typeof payload === "string") {
      data = payload as string;
    } else {
      return false;
    }

    try {
      const hmac = crypto.createHmac("sha256", this.secret);
      const expectedHex = hmac.update(data as unknown as crypto.BinaryLike).digest("hex");

      const received = Buffer.from(sigHex, "hex");
      const expected = Buffer.from(expectedHex, "hex");
      const receivedView = new Uint8Array(
        received.buffer,
        received.byteOffset,
        received.byteLength,
      );
      const expectedView = new Uint8Array(
        expected.buffer,
        expected.byteOffset,
        expected.byteLength,
      );

      return (
        receivedView.length === expectedView.length &&
        crypto.timingSafeEqual(receivedView, expectedView)
      );
    } catch {
      return false;
    }
  }

  private runScript(path: string): Promise<WebhookResponse> {
    return new Promise((resolve) => {
      exec(`bash ${path}`, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Error ejecutando ${path}: ${error.message}`);
          resolve({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: `Error al ejecutar ${path}: ${error.message}`,
          });
          return;
        }

        if (stderr) this.logger.warn(stderr);
        this.logger.log(stdout);

        resolve({
          status: HttpStatus.OK,
          message: `Script ${path} ejecutado correctamente.`,
        });
      });
    });
  }

  async handlePush(payload: GithubPushPayload): Promise<WebhookResponse> {
    const repoName = payload.repository?.name;

    switch (repoName) {
      case "api":
        this.logger.log("🚀 Desplegando backend...");
        return await this.runScript(this.backendScript);

      case "front":
        this.logger.log("🧱 Desplegando frontend...");
        return await this.runScript(this.frontendScript);

      case "web":
        this.logger.log("🧱 Desplegando web...");
        return await this.runScript(this.webScript);

      default:
        this.logger.warn(`Push recibido de repo desconocido: ${repoName}`);
        return {
          status: HttpStatus.NOT_IMPLEMENTED,
          message: `Repositorio no soportado: ${repoName}`,
        };
    }
  }

  async getDashboard(): Promise<DashboardResponse> {
    const startedAtMs = Date.now() - Math.floor(process.uptime() * 1000);
    const startedAt = new Date(startedAtMs).toISOString();

    let databaseOk = true;
    let databaseLatencyMs: number | null = null;
    try {
      const t0 = Date.now();
      await this.httpLogRepository.query("SELECT 1");
      databaseLatencyMs = Date.now() - t0;
    } catch (e) {
      databaseOk = false;
    }

    const recentErrors: RecentErrorLog[] = await this.httpLogRepository.find({
      where: { statusCode: 500 },
      order: { createdAt: "DESC" },
      take: 20,
      select: ["id", "method", "url", "statusCode", "user", "ip", "errorMessage", "createdAt"],
    });

    const services = {
      database: {
        ok: databaseOk,
        latencyMs: databaseLatencyMs,
      },
    };

    const memory = process.memoryUsage();

    const general = {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      env: this.configService.get<string>("NODE_ENV"),
      startedAt,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external,
      },
    };

    const status = {
      ok: true,
      timestamp: new Date().toISOString(),
    };

    return {
      status,
      services,
      general,
      recentErrors,
    };
  }
}
