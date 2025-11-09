import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VersionEntity, VersionStatus } from "../entities/version.entity";
import { CreateVersionDto } from "../dto/version.dto";

@Injectable()
export class VersionService {
  constructor(
    @InjectRepository(VersionEntity)
    private readonly versionRepository: Repository<VersionEntity>,
  ) {}

  async createVersion(data: CreateVersionDto): Promise<VersionEntity> {
    const prevVersions = await this.versionRepository.find({
      where: [{ status: VersionStatus.PENDING }, { status: VersionStatus.UPDATED }],
    });

    for (const prev of prevVersions) {
      prev.status = VersionStatus.INACTIVE;
      await this.versionRepository.save(prev);
    }

    const newVersion = this.versionRepository.create({
      ...data,
      status: VersionStatus.PENDING,
    });

    return this.versionRepository.save(newVersion);
  }

  async updateVersionStatus(id: number, status: VersionStatus): Promise<VersionEntity> {
    const version = await this.versionRepository.findOne({ where: { id } });
    if (!version) throw new Error("Version not found");

    if (status === VersionStatus.UPDATED) {
      const activeVersions = await this.versionRepository.find({
        where: { status: VersionStatus.UPDATED },
      });

      for (const v of activeVersions) {
        v.status = VersionStatus.INACTIVE;
        await this.versionRepository.save(v);
      }
    }

    version.status = status;
    return this.versionRepository.save(version);
  }

  async getCurrentVersion(): Promise<string | null> {
    let current = await this.versionRepository.findOne({
      where: { status: VersionStatus.UPDATED },
      order: { createdAt: "DESC" },
      select: ["version"],
    });

    if (!current) {
      current = await this.versionRepository.findOne({
        where: { status: VersionStatus.PENDING },
        order: { createdAt: "DESC" },
        select: ["version"],
      });
    }

    return current ? current.version : null;
  }

  async getAllVersions(): Promise<VersionEntity[]> {
    return await this.versionRepository.find({ order: { createdAt: "DESC" } });
  }
}
