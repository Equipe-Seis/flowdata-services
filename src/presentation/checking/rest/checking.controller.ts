import { CreateCheckingDto } from '@application/checking/dto/create-checking.dto';
import { CheckingService } from '@application/checking/services/checking.service';
import {
	Controller,
	Get,
	Post,
	Param,
	ParseIntPipe,
	Body,
	Delete,
	Patch,
} from '@nestjs/common';
import { CreateCheckingLineDto } from '@application/checking/dto/create-checking-line.dto';
import { UpdateCheckingLineDto } from '@application/checking/dto/update-checking-line.dto';

// TODO: improve API documentation
// TODO: add delete method
@Controller('checkings')
export class CheckingController {
	constructor(private readonly checkingService: CheckingService) {}

	@Post()
	async create(@Body() dto: CreateCheckingDto) {
		const result = await this.checkingService.create(dto);
		return result.mapToPresentationResult();
	}

	@Get()
	async findAll() {
		const result = await this.checkingService.findAll();
		return result.mapToPresentationResult();
	}

	@Get(':id')
	async findById(@Param('id', ParseIntPipe) id: number) {
		const result = await this.checkingService.findById(id);
		return result.mapToPresentationResult();
	}

	@Post(':id/conclude')
	async conclude(@Param('id', ParseIntPipe) id: number) {
		const result = await this.checkingService.concludeChecking(id);
		return result.mapToPresentationResult();
	}

	@Delete(':id')
	async delete(@Param('id', ParseIntPipe) id: number) {
		const result = await this.checkingService.delete(id);
		return result.mapToPresentationResult();
	}

	//#region Lines
	@Post('lines')
	async addLine(@Body() dto: CreateCheckingLineDto[]) {
		const result = await this.checkingService.addLine(dto);
		return result.mapToPresentationResult();
	}

	@Delete(':checkingId/lines/:lineId')
	async deleteLine(
		@Param('checkingId', ParseIntPipe) checkingId: number,
		@Param('lineId', ParseIntPipe) lineId: number,
	) {
		const result = await this.checkingService.deleteLine(checkingId, lineId);
		return result.mapToPresentationResult();
	}

	@Patch(':checkingId/lines/:lineId')
	async updateLine(
		@Param('checkingId', ParseIntPipe) checkingId: number,
		@Param('lineId', ParseIntPipe) lineId: number,
		@Body() dto: UpdateCheckingLineDto,
	) {
		const result = await this.checkingService.updateLine(
			checkingId,
			lineId,
			dto,
		);
		return result.mapToPresentationResult();
	}
	//#endregion
}
