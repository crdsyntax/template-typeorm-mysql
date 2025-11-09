import { Global, Module } from "@nestjs/common";
import { TranslationService } from "../services/transalation.service";
import { User } from "@/user/entities/user.entity";

@Global()
@Module({
  providers: [TranslationService],
  exports: [TranslationService],
})
export class GlobalServicesModule {}

export const ENTITIES = {
  USER: User
} as const;

export type ENTITITYPES = typeof ENTITIES[keyof typeof ENTITIES];

export type EUSER = InstanceType<typeof ENTITIES['USER']>;
