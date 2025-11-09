import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("http_logs")
export class HttpLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10 })
  method: string;

  @Column({ type: "text" })
  url: string;

  @Column({ type: "varchar" })
  user: string;

  @Column({ type: "json", nullable: true })
  body: Record<string, any>;

  @Column({ type: "json", nullable: true })
  query: Record<string, any>;

  @Column({ type: "json", nullable: true })
  params: Record<string, any>;

  @Column({ type: "int", nullable: true })
  statusCode: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  contentLength: string;

  @Column({ type: "int", nullable: true })
  responseTime: number;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent: string;

  @Column({ type: "boolean", default: false })
  isError: boolean;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @Column({ type: "longtext", nullable: true })
  errorStack?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
