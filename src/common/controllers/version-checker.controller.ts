import { Body, Controller, Post, Param, Patch, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { VersionService } from "../services/version.service";
import { VersionEntity, VersionStatus } from "../entities/version.entity";
import { CreateVersionDto } from "../dto/version.dto";

@ApiTags("version")
@Controller("common/version")
export class VersionCheckerController {
  constructor(private readonly versionService: VersionService) {}

  @Post()
  createVersion(@Body() body: CreateVersionDto): Promise<VersionEntity> {
    return this.versionService.createVersion(body);
  }

  @Patch(":id/update")
  markVersionUpdated(@Param("id") id: number): Promise<VersionEntity> {
    return this.versionService.updateVersionStatus(Number(id), VersionStatus.UPDATED);
  }

  @Get("current")
  getCurrentVersion(): Promise<VersionEntity["version"] | null> {
    return this.versionService.getCurrentVersion();
  }
}
