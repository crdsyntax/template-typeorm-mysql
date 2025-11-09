import {
  Controller,
  Post,
  Headers,
  Body,
  Logger,
  Req,
  Get,
  Header,
  UseGuards,
} from "@nestjs/common";
import { AppService } from "./app.service";
import os from "os";
import { BasicAuthGuard } from "./common/guards/basic-auth.guard";
import type { Request } from "express";

@Controller("github-webhook")
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly webhookService: AppService) {}

  @Post()
  async handleWebhook(
    @Headers("x-github-event") event: string,
    @Headers("x-hub-signature-256") signature: string,
    @Body() body: Record<string, unknown>,
    @Req() _req: Request,
  ): Promise<{ status: any; message: string } | { status: string; message: string }> {
    const rawBody = (_req as any)?.rawBody as Buffer | undefined;
    const payloadForSignature = Buffer.isBuffer(rawBody)
      ? rawBody
      : typeof body === "string"
        ? (body as unknown as string)
        : JSON.stringify(body ?? "");
    const isValid = this.webhookService.verifySignature(payloadForSignature, signature);

    if (!isValid) {
      this.logger.warn("Firma inválida detectada en el webhook.");
      return { status: "error", message: "Firma inválida" };
    }

    if (event === "push") {
      const result = await this.webhookService.handlePush(body as any);
      return { status: result.status, message: result.message };
    }

    this.logger.log(`Evento ignorado: ${event}`);
    return { status: "ok", message: `Evento ${event} recibido pero no manejado.` };
  }
}

@Controller("status")
export class StatusController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  @Header("Content-Type", "text/html; charset=utf-8")
  async getDashboard(): Promise<string> {
    const data = await this.appService.getDashboard();
    const db = data.services?.database ?? { ok: false, latencyMs: null };
    const recent = Array.isArray(data.recentErrors) ? data.recentErrors : [];

    const memTotal = os.totalmem() / 1024 / 1024; // MB
    const memFree = os.freemem() / 1024 / 1024;
    const memUsed = memTotal - memFree;
    const memUsedPercent = ((memUsed / memTotal) * 100).toFixed(1);

    const recentErrorsHtml = recent
      .map(
        (e) => `
          <li>
            <code>#${e.id}</code>
            <span class="badge ${e.statusCode === 500 ? "bad" : "ok"}">${e.statusCode}</span>
            <strong>${e.method} ${e.url}</strong>
            <div class="muted">${new Date(e.createdAt as unknown as string).toLocaleString()} · ${e.ip} · ${e.userAgent ?? "-"}</div>
            ${e.errorMessage ? `<pre>${String(e.errorMessage).slice(0, 600)}</pre>` : ""}
          </li>`,
      )
      .join("");

    return `<!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Feliz Viaje - Dashboard</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #e2e8f0; }
      .container { max-width: 960px; margin: 6vh auto; padding: 32px; background: #111827; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.35); border: 1px solid #1f2937; }
      h1 { margin: 0 0 8px; font-size: 28px; color: #f8fafc; }
      .tag { display: inline-block; margin-top: 14px; padding: 4px 10px; font-size: 12px; background: #0ea5e9; color: #0b1220; border-radius: 999px; font-weight: 600; }
      .muted { color: #94a3b8; }
      .footer { margin-top: 22px; font-size: 12px; color: #64748b; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 20px; }
      .card { padding: 16px; background: #0b1220; border: 1px solid #1f2937; border-radius: 10px; }
      .key { color: #93c5fd; }
      .ok { color: #34d399; }
      .bad { color: #f87171; }
      .bar { height: 8px; border-radius: 4px; overflow: hidden; background: #1e293b; margin-top: 6px; }
      .bar-fill { height: 100%; background: linear-gradient(to right, #34d399, #10b981); }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #1f2937; margin-left: 6px; }
      ul.logs { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
      pre { background: #0a0f1a; padding: 10px; border-radius: 8px; overflow-x: auto; border: 1px solid #1f2937; color: #cbd5e1; }
    </style>
  </head>
  <body>
    <main class="container">
      <h1>API Feliz Viaje</h1>
      <span class="tag">Dashboard</span>
      <p class="muted">Estado del servicio y últimos errores (500) registrados.</p>
  
      <section class="card" style="margin-top:16px;">
        <h3>Estado del sistema</h3>
        <div style="margin-top:10px;">
          <p><strong>API</strong> <span class="${data.status.ok ? "ok" : "bad"}">${data.status.ok ? "Operativa" : "Inactiva"}</span></p>
          <div class="bar"><div class="bar-fill" style="width:${data.status.ok ? "100%" : "20%"}"></div></div>
  
          <p style="margin-top:12px;"><strong>Base de datos</strong> <span class="${db.ok ? "ok" : "bad"}">${db.ok ? "Conectada" : "Error"}</span></p>
          <div class="bar"><div class="bar-fill" style="width:${db.ok ? "100%" : "30%"}"></div></div>
  
          <p style="margin-top:12px;"><strong>Memoria del servidor</strong> <span class="muted">(${memUsedPercent}% usada)</span></p>
          <div class="bar"><div class="bar-fill" style="width:${memUsedPercent}%;background:#60a5fa;"></div></div>
        </div>
      </section>
  
      <section class="grid">
        <div class="card">
          <h3>Base de Datos</h3>
          <p><span class="key">OK:</span> <span class="${db.ok ? "ok" : "bad"}">${String(db.ok)}</span></p>
          <p><span class="key">Latencia:</span> ${db.latencyMs ?? "-"} ms</p>
        </div>
  
        <div class="card">
          <h3>General</h3>
          <p><span class="key">PID:</span> ${data.general.pid}</p>
          <p><span class="key">Node:</span> ${data.general.nodeVersion}</p>
          <p><span class="key">Plataforma:</span> ${data.general.platform}</p>
          <p><span class="key">Entorno:</span> ${data.general.env ?? "-"}</p>
          <p><span class="key">Inició:</span> ${data.general.startedAt}</p>
          <p><span class="key">Uptime:</span> ${data.general.uptimeSeconds}s</p>
        </div>
      </section>
  
      <section class="card" style="margin-top:20px;">
        <h3>Errores recientes (500)</h3>
        ${recent.length === 0 ? '<p class="muted">Sin errores recientes.</p>' : `<ul class="logs">${recentErrorsHtml}</ul>`}
      </section>
  
      <div class="footer">&copy; ${new Date().getFullYear()} Feliz Viaje</div>
    </main>
  </body>
  </html>`;
  }
}
