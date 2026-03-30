import "http";

declare global {
  namespace Express {
    interface User {
      sub?: string;
      id?: string;
      username?: string;
      [key: string]: unknown;
    }
    interface Request {
      rawBody?: Buffer;
    }
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}
