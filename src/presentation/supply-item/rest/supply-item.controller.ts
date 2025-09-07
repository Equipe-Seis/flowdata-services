import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
} from '@nestjs/common';
import { CreateSupplyDto } from 'src/application/supply-item/dto';
import { SupplyItemService } from 'src/application/supply-item/services/supply-item.service';

@Controller('supply')
export class SupplyItemController {
	constructor(private supplyItemService: SupplyItemService) {}

	@Get()
	async get() {
		const result = await this.supplyItemService.getAll();
		return result.mapToPresentationResult();
	}

	@Get(':id')
	async getById(@Param('id', ParseIntPipe) id: number) {
		const result = await this.supplyItemService.getById(id);
		return result.mapToPresentationResult();
	}

	@Post()
	async post(@Body() dto: CreateSupplyDto) {
		const result = await this.supplyItemService.createSupplyItem(dto);
		return result.mapToPresentationResult();
	}
}
