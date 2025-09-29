import { InventoryResponseDto } from "@application/inventory/dto/inventory-response.dto";
import { InventoryMapper } from "@application/inventory/mappers/inventory.mapper";
import { IInventoryRepository } from "@application/inventory/persistence/iinvent.repository";
import { Result } from "@domain/shared/result/result.pattern";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class InventoryService {

  constructor(
    @Inject(IInventoryRepository)
    private readonly inventRepository: IInventoryRepository
  ) {}

  async findAll() : Promise<Result<InventoryResponseDto[]>> {
    const result = await this.inventRepository.findAll();

    if (result.isFailure) {
      return Result.Fail(result.getError());
    }

    const value = result.getValue();

    if (!value) {
      return Result.NoContent();
    }

    return Result.Ok(value.map(InventoryMapper.fromEntity));
  }  
}