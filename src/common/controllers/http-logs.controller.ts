import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HttpLoggerService } from "../services/http-logger.service";
import { HttpLogFilterDto } from "../dto/api.dto";

@ApiTags("http-logs")
@Controller("common/http-logs")
export class HttpLogsController {
  constructor(private readonly httpLoggerService: HttpLoggerService) {}

  @Post()
  getLogs(@Body() query: HttpLogFilterDto): Promise<any> {
    return this.httpLoggerService.getLogs(query);
  }
}
