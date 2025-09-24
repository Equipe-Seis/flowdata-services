import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SearchCnpjService } from '@/application/shared/cnpj/services/search-cnpj.service';
import { SearchCnpjResponseDto } from '@/application/shared/cnpj/dto/search-cnpj-response.dto';
import { JwtGuard } from '@presentation/shared/guard';
import { HasPermission } from '@presentation/shared/decorator/permission.decorator';
import { HasProfile } from '@presentation/shared/decorator/profile.decorator';
import { ProfileGuard } from '@presentation/shared/guard/profile.guard';


@UseGuards(JwtGuard, ProfileGuard)
@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
@Controller('cnpj')
export class SearchCnpjController {
    constructor(private readonly searchCnpjService: SearchCnpjService) { }

    @Get(':cnpj')
    async getCnpj(@Param('cnpj') cnpj: string): Promise<SearchCnpjResponseDto> {
        return this.searchCnpjService.searchCnpj(cnpj);
    }
}

