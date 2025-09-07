import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupplierService } from '@application/supplier/services/supplier.service';
import { CreateSupplierDto } from '@application/supplier/dto/create-supplier.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new supplier with person' })
    @ApiResponse({ status: 201, description: 'Supplier created' })
    async create(@Body() dto: CreateSupplierDto) {
        return this.supplierService.createSupplier(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all suppliers' })
    async findAll() {
        return this.supplierService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get supplier by ID' })
    async findById(@Param('id') id: string) {
        return this.supplierService.findById(+id);
    }
}
