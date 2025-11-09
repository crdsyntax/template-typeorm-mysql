import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum VersionStatus {
  PENDING = "PENDING",
  UPDATED = "UPDATED",
  INACTIVE = "INACTIVE",
}

export enum VersionType {
  UPGRADE = "UPGRADE",
  FIX = "FIX",
}

@Entity("tb_version")
export class VersionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  title: string;

  @Column({ type: "varchar", length: 255 })
  description: string;

  @Column({ type: "json" })
  tickets: string[];

  @Column({ type: "varchar", length: 16 })
  type: VersionType;

  @Column({ type: "varchar", length: 100 })
  owner: string;

  @Column({ type: "varchar", length: 50 })
  version: string;

  @Column({ type: "varchar", length: 16 })
  status: VersionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
