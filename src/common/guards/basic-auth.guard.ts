import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const setWwwAuthenticate = (): void => {
      try {
        if (response && typeof response.setHeader === "function") {
          response.setHeader("WWW-Authenticate", 'Basic realm="FelizViaje", charset="UTF-8"');
        }
      } catch {
        // ignore header setting errors
      }
    };
    const header: string | undefined = request.headers["authorization"];

    if (!header || !header.startsWith("Basic ")) {
      setWwwAuthenticate();
      throw new UnauthorizedException("Missing Basic authorization header");
    }

    const base64Credentials = header.slice(6).trim();
    let decoded = "";
    try {
      decoded = Buffer.from(base64Credentials, "base64").toString("utf8");
    } catch {
      setWwwAuthenticate();
      throw new UnauthorizedException("Invalid Basic authorization encoding");
    }

    const sepIndex = decoded.indexOf(":");
    if (sepIndex === -1) {
      setWwwAuthenticate();
      throw new UnauthorizedException("Invalid Basic authorization format");
    }

    const username = decoded.slice(0, sepIndex);
    const password = decoded.slice(sepIndex + 1);

    const expectedUser = this.configService.get<string>("DASHBOARD_USER");
    const expectedPass = this.configService.get<string>("DASHBOARD_PASS");

    if (!expectedUser || !expectedPass) {
      setWwwAuthenticate();
      throw new UnauthorizedException("Dashboard credentials not configured");
    }

    if (username !== expectedUser || password !== expectedPass) {
      setWwwAuthenticate();
      throw new UnauthorizedException("Invalid dashboard credentials");
    }

    return true;
  }
}
