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
	UseGuards,
	HttpStatus,
} from '@nestjs/common';
import { CreateCheckingLineDto } from '@application/checking/dto/create-checking-line.dto';
import { UpdateCheckingLineDto } from '@application/checking/dto/update-checking-line.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HasProfile } from '@presentation/shared/decorator/profile.decorator';
import { JwtGuard, ProfileGuard } from '@presentation/shared/guard';

@Controller('checkings')
export class CheckingController {
	constructor(private readonly checkingService: CheckingService) {}

	@ApiOperation({ summary: 'Create a new checking.' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Checking created successfully',
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
	async create(@Body() dto: CreateCheckingDto) {
		const result = await this.checkingService.create(dto);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Get all checkings.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of all checking.',
	})
	@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
	@UseGuards(JwtGuard, ProfileGuard)
	@Get()
	async findAll() {
		const result = await this.checkingService.findAll();
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Get checking info by id.' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Checking info',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Checking not found',
	})
	@HasProfile('admin', 'supply_supervisor', 'supply_stock_keeper')
	@UseGuards(JwtGuard, ProfileGuard)
	@Get(':id')
	async findById(@Param('id', ParseIntPipe) id: number) {
		const result = await this.checkingService.findById(id);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Conclude a checking.' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Checking concluded' })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Checking not found',
	})
	@HasProfile('admin', 'supply_supervisor')
	@UseGuards(JwtGuard, ProfileGuard)
	@Post(':id/conclude')
	async conclude(@Param('id', ParseIntPipe) id: number) {
		const result = await this.checkingService.concludeChecking(id);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Revert a concluded checking.' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Checking reverted' })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Checking not found',
	})
	@HasProfile('admin', 'supply_supervisor')
	@UseGuards(JwtGuard, ProfileGuard)
	@Post(':id/revert')
	async revert(@Param('id', ParseIntPipe) id: number) {
		const result = await this.checkingService.revertChecking(id);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Delete a checking by id.' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Checking deleted',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Checking not found',
	})
	@HasProfile('admin')
	@UseGuards(JwtGuard, ProfileGuard)
	@Delete(':id')
	async delete(@Param('id', ParseIntPipe) id: number) {
		const result = await this.checkingService.delete(id);
		return result.mapToPresentationResult();
	}

	//#region Lines
	@ApiOperation({ summary: 'Add lines to a checking.' })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Lines added' })
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input data',
	})
	@HasProfile('admin', 'supply_supervisor')
	@UseGuards(JwtGuard, ProfileGuard)
	@Post('lines')
	async addLine(@Body() dto: CreateCheckingLineDto[]) {
		const result = await this.checkingService.addLine(dto);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Delete a line from a checking.' })
	@ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Line deleted' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Line not found' })
	@HasProfile('admin', 'supply_supervisor')
	@UseGuards(JwtGuard, ProfileGuard)
	@Delete(':checkingId/lines/:lineId')
	async deleteLine(
		@Param('checkingId', ParseIntPipe) checkingId: number,
		@Param('lineId', ParseIntPipe) lineId: number,
	) {
		const result = await this.checkingService.deleteLine(checkingId, lineId);
		return result.mapToPresentationResult();
	}

	@ApiOperation({ summary: 'Update a checking line.' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Line updated' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Line not found' })
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input data',
	})
	@HasProfile('admin', 'supply_supervisor')
	@UseGuards(JwtGuard, ProfileGuard)
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
