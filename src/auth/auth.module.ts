import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";

@Module({
    imports: [InfrastructureModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {
}