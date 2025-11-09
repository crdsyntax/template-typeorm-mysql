import { User } from "@/user/entities/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("tb_password_reset_tokens")
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "code_hash", length: 255 })
  codeHash: string;

  @Column({ type: "datetime", name: "expires_at" })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  used: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
