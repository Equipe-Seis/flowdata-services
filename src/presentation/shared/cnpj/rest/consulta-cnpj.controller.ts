import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ConsultaCnpjService } from '@/application/shared/cnpj/services/consulta-cnpj.service';
import { ConsultaCnpjResponseDto } from '@/application/shared/cnpj/dto/consulta-cnpj-response.dto';
import { JwtGuard } from '@presentation/shared/guard';
import { HasPermission } from '@presentation/shared/decorator/permission.decorator';
import { HasProfile } from '@presentation/shared/decorator/profile.decorator';
import { ProfileGuard } from '@presentation/shared/guard/profile.guard';


@UseGuards(JwtGuard, ProfileGuard)
@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
@Controller('cnpj')
export class ConsultaCnpjController {
    constructor(private readonly consultaCnpjService: ConsultaCnpjService) { }

    @Get(':cnpj')
    async getCnpj(@Param('cnpj') cnpj: string): Promise<ConsultaCnpjResponseDto> {
        return this.consultaCnpjService.consultarCnpj(cnpj);
    }
}