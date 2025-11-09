declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        username?: string;
        [key: string]: any;
      };
    }
  }
}
