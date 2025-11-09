import { Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: any) {
    for (const key in value) {
      if (typeof value[key] === "string") {
        try {
          value[key] = JSON.parse(value[key]);
        } catch {}
      }
    }
    return value;
  }
}
