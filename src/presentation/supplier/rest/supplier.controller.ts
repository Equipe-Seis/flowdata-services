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
import { SupplierSummary } from '@domain/supplier/types/supplierSummary.type';
import { JwtGuard } from '@domain/shared/guard';
import { HasPermission } from '@infrastructure/auth/decorators/permission.decorator';
import { HasProfile } from '@infrastructure/auth/decorators/profile.decorator';
import { ProfileGuard } from '@infrastructure/auth/guards/profile.guard';

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
}
