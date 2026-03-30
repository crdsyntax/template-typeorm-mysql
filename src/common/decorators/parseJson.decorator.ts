import { Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object") {
      const val = value as Record<string, unknown>;
      for (const key in val) {
        if (typeof val[key] === "string") {
          try {
            val[key] = JSON.parse(val[key]);
          } catch {
            // Not a JSON string, ignore
          }
        }
      }
      return val;
    }
    return value as Record<string, unknown>;
  }
}
