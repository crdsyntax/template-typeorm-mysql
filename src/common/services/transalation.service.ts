import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class TranslationService {
  private readonly data: Record<string, any>;

  constructor() {
    const filePath = path.resolve(process.cwd(), "lib/i18n", "es.json");
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      this.data = JSON.parse(content);
    } catch (error) {
      Logger.error(`Error cargando traducciones desde ${filePath}: ${error.message}`, error.stack);
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split(".");
    let result: any = this.data;
    for (const p of parts) {
      result = result?.[p];
      if (result == null) {
        return key;
      }
    }
    let text = result as string;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{${k}}}`, "g"), String(v));
      }
    }
    return text;
  }
}
