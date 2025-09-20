import { CreateCheckingDto } from '@application/checking/dto/create-checking.dto';
import { CheckingService } from '@application/checking/services/checking.service';
import { Controller, Get, Post, Param, ParseIntPipe, Body } from '@nestjs/common';

@Controller('checkings')
export class CheckingController {
  constructor(private readonly checkingService: CheckingService) {}

  @Post()
  async create(@Body() dto: CreateCheckingDto) {
    var result = await this.checkingService.create(dto);
    return result.mapToPresentationResult();
  }

  @Get()
  async findAll() {
    var result = await this.checkingService.findAll();
    return result.mapToPresentationResult();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    var result = await this.checkingService.findById(id);
    return result.mapToPresentationResult();
  }
}
