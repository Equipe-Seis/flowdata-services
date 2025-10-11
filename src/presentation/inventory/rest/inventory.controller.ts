import { InventoryService } from "@application/inventory/services/inventory.service";
import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HasProfile } from "@presentation/shared/decorator/profile.decorator";
import { JwtGuard, ProfileGuard } from "@presentation/shared/guard";

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) 
    {}

	@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
	@ApiOperation({ summary: 'Get all supply items.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of all supply items.',
	})
	@UseGuards(JwtGuard, ProfileGuard)
    @Get()
    async findAll() {
        const result = await this.inventoryService.findAll();
        return result.mapToPresentationResult();
    }
}