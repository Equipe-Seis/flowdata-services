import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    Body,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    UseInterceptors,
    ClassSerializerInterceptor,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery
} from '@nestjs/swagger';
import { SupplierService } from '@application/supplier/services/supplier.service';
import { CreateSupplierDto } from '@application/supplier/dto/create-supplier.dto';
import { UpdateSupplierDto } from '@application/supplier/dto/update-supplier.dto';
import { SupplierSummary } from '@domain/supplier/types/supplierSummary.type';
import { JwtGuard } from '@presentation/shared/guard';
import { HasPermission } from '@presentation/shared/decorator/permission.decorator';
import { HasProfile } from '@presentation/shared/decorator/profile.decorator';
import { ProfileGuard } from '@presentation/shared/guard/profile.guard';


@ApiTags('Suppliers')
@Controller('suppliers')

export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Get()
    @ApiOperation({ summary: 'Get paginated list of suppliers' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: 200, description: 'List of suppliers retrieved successfully' })
    @UseGuards(JwtGuard, ProfileGuard)
    @HasProfile('admin')
    async findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
    ): Promise<{ data: SupplierSummary[]; total: number }> {
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        return this.supplierService.findAll(pageNumber, limitNumber);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new supplier' })
    @ApiResponse({ status: 201, description: 'Supplier created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @UseGuards(JwtGuard, ProfileGuard)
    @HasProfile('admin')
    async createSupplier(@Body() createSupplierDto: CreateSupplierDto) {
        const result = await this.supplierService.createSupplier(createSupplierDto);
        return result.mapToPresentationResult();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get supplier by ID' })
    @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Supplier not found' })
    @UseGuards(JwtGuard, ProfileGuard)
    @HasProfile('admin')
    async findById(@Param('id', ParseIntPipe) id: number) {
        const result = await this.supplierService.findById(id);
        return result.mapToPresentationResult();
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update supplier' })
    @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
    @ApiResponse({ status: 404, description: 'Supplier not found' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @UseGuards(JwtGuard, ProfileGuard)
    @HasProfile('admin')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSupplierDto
    ) {
        const result = await this.supplierService.updateSupplier(id, dto);
        return result.mapToPresentationResult();
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete supplier' })
    @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
    @ApiResponse({ status: 404, description: 'Supplier not found' })
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtGuard, ProfileGuard)
    @HasProfile('admin')
    async delete(@Param('id', ParseIntPipe) id: number) {
        const result = await this.supplierService.deleteSupplier(id);
        return result.mapToPresentationResult();
    }
}
