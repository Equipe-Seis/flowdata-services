import { CreateSupplyDto } from '@application/supply-item/dto';
import { FindAllSuppliesDto } from '@application/supply-item/dto/find-all-supplies.dto';
import { SupplyItemService } from '@application/supply-item/services/supply-item.service';
import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@presentation/shared/guard';
import { HasProfile } from '@presentation/shared/decorator/profile.decorator';
import { ProfileGuard } from '@presentation/shared/guard/profile.guard';


@ApiTags('SupplyItem')
@Controller('supply')
export class SupplyItemController {
	constructor(private supplyItemService: SupplyItemService) {}

	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
	@Get()
	@ApiOperation({ summary: 'Get all supply items.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of all supply items.',
	})
	@UseGuards(JwtGuard)
	async get(@Query() filters: FindAllSuppliesDto) {
		const result = await this.supplyItemService.getAll(filters);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Get supply item info by code.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Supply item info',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
	})
	@UseGuards(JwtGuard, ProfileGuard)
	@Get('getByCode/:code')
	async getByCode(@Param('code') code: string) {
		const result = await this.supplyItemService.getByCode(code);
		return result.mapToPresentationResult();
	}

	@UseGuards(JwtGuard, ProfileGuard)
	@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
	@Get(':id')
	@ApiOperation({ summary: 'Get supply item info by id.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Supply item info',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Supply item not found',
	})
	@UseGuards(JwtGuard)
	async getById(@Param('id', ParseIntPipe) id: number) {
		const result = await this.supplyItemService.getById(id);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Create a new supply item.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Supply created successfully',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input data',
	})
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: 'Internal server error',
	})
	@HasProfile('admin', 'supply_supervisor')
	@UseGuards(JwtGuard, ProfileGuard)
	@Post()
	async post(@Body() dto: CreateSupplyDto) {
		const result = await this.supplyItemService.createSupplyItem(dto);
		return result.mapToPresentationResult();
	}
}
