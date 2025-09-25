import { CreateSupplyDto } from '@application/supply-item/dto';
import { FindAllSuppliesDto } from '@application/supply-item/dto/find-all-supplies.dto';
import { SupplyItemService } from '@application/supply-item/services/supply-item.service';
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Query, // 1. Importar o Query decorator
	UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@presentation/shared/guard';
import { HasPermission } from '@presentation/shared/decorator/permission.decorator';
import { HasProfile } from '@presentation/shared/decorator/profile.decorator';
import { ProfileGuard } from '@presentation/shared/guard/profile.guard';


@Controller('supply')
export class SupplyItemController {
	constructor(private supplyItemService: SupplyItemService) { }

	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
	@Get()
	async get(@Query() filters: FindAllSuppliesDto) {
		const result = await this.supplyItemService.getAll(filters);
		return result.mapToPresentationResult();
	}

	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
	@Get(':id')
	async getById(@Param('id', ParseIntPipe) id: number) {
		const result = await this.supplyItemService.getById(id);
		return result.mapToPresentationResult();
	}

	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin', 'supply_supervisor')
	@Post()
	async post(@Body() dto: CreateSupplyDto) {
		const result = await this.supplyItemService.createSupplyItem(dto);
		return result.mapToPresentationResult();
	}
}
