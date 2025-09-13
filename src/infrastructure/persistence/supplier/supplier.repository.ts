import { Injectable } from '@nestjs/common';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { SupplierModel } from '@domain/supplier/models/supplier.model';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { Supplier } from '@prisma/client';
import { PersonMapper } from '@application/person/mappers/person.mapper';
import { SupplierWithPerson } from '@domain/supplier/types/supplierPerson.type';
import { SupplierSummary } from '@domain/supplier/types/supplierSummary.type';


@Injectable()
export class SupplierRepository
	extends PrismaRepository
	implements ISupplierRepository {
	async findAll(page: number, limit: number): Promise<{ data: SupplierSummary[]; total: number }> {
		const skip = (page - 1) * limit;

		const total = await this.prismaService.supplier.count();

		const suppliers = await this.prismaService.supplier.findMany({
			skip,
			take: limit,
			include: {
				person: true,
			},
			orderBy: {
				person: {
					name: 'asc',
				},
			},
		});

		const data: SupplierSummary[] = suppliers.map(supplier => ({
			id: supplier.id,
			name: supplier.person.name,
			email: supplier.person.email ?? null,
			documentNumber: supplier.person.documentNumber,
			status: supplier.person.status,
			tradeName: supplier.tradeName ?? undefined,
		}));

		return { data, total };
	}


	async create(
		user: SupplierModel,
		personId: number,
		tx?: any, // Recebe o cliente de transação do Prisma (se não passado, usa this.prismaService)
	): Promise<Result<Supplier>> {
		const client = tx ?? this.prismaService;

		try {
			const supplier = await client.supplier.create({
				data: {
					tradeName: user.tradeName,
					openingDate: user.openingDate,
					type: user.type,
					size: user.size,
					legalNature: user.legalNature,
					personId: personId,
				},
			});

			return Result.Ok(supplier);
		} catch (error) {
			return Result.Fail('Failed to create supplier: ' + (error instanceof Error ? error.message : 'Unknown'));
		}
	}


	async findById(id: number): Promise<Result<SupplierWithPerson | null>> {
		return Result.Ok(null);
	}

	async findByEmail(email: string): Promise<Result<SupplierWithPerson | null>> {
		return Result.Ok(null);
	}

	async findByDocumentNumber(documentNumber: string): Promise<Result<SupplierWithPerson | null>> {
		return Result.Ok(null);
	}

	async update(id: number, user: SupplierModel): Promise<Result<SupplierWithPerson | null>> {
		return Result.Ok(null);
	}

	async delete(id: number): Promise<Result<void>> {
		return Result.Ok(undefined);
	}
}
