import { Injectable } from '@nestjs/common';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { SupplierModel } from '@domain/supplier/models/supplier.model';
import { Result } from '@domain/shared/result/result.pattern';
import { PrismaRepository } from '@infrastructure/persistence/repository/prisma.repository';
import { Supplier } from '@prisma/client';
import { PersonMapper } from '@application/person/mappers/person.mapper';
import { SupplierWithPerson } from '@domain/supplier/types/supplierPerson.type';
import { SupplierSummary } from '@domain/supplier/types/supplierSummary.type';
import { ContactMapper } from '@application/person/mappers/contact.mapper';
import { AddressMapper } from '@application/person/mappers/address.mapper';



@Injectable()
export class SupplierRepository extends PrismaRepository implements ISupplierRepository {

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

	async create(user: SupplierModel, personId: number, tx?: any): Promise<Result<Supplier>> {
		const client = tx ?? this.prismaService;

		try {
			// Criar o supplier
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

			// Criar contatos associados (se houver)
			if (user.contacts && user.contacts.length > 0) {
				for (const contact of user.contacts) {
					await client.contact.create({
						data: {
							personId: personId,
							type: contact.type,
							value: contact.value,
							note: contact.note,
							primary: contact.primary ?? false,
							linkType: contact.linkType,
						},
					});
				}
			}

			// Criar endereços associados (se houver)
			if (user.addresses && user.addresses.length > 0) {
				for (const address of user.addresses) {
					await client.address.create({
						data: {
							personId: personId,
							street: address.street,
							district: address.district,
							city: address.city,
							state: address.state,
							postalCode: address.postalCode,
							linkType: address.linkType,
						},
					});
				}
			}

			return Result.Ok(supplier);
		} catch (error) {
			return Result.Fail('Failed to create supplier: ' + (error instanceof Error ? error.message : 'Unknown'));
		}
	}

	async findById(id: number): Promise<Result<SupplierWithPerson | null>> {
		try {
			const supplier = await this.prismaService.supplier.findUnique({
				where: { id },
				include: {
					person: {
						include: {
							contacts: true,
							addresses: true,
						},
					},
				},
			});

			if (!supplier) {
				return Result.Ok(null);
			}

			const supplierWithPerson: SupplierWithPerson = {
				id: supplier.id,
				tradeName: supplier.tradeName ?? undefined,
				openingDate: supplier.openingDate ?? undefined,
				type: supplier.type ?? undefined,
				size: supplier.size ?? undefined,
				legalNature: supplier.legalNature ?? undefined,
				person: supplier.person,
				contacts: supplier.person.contacts,
				addresses: supplier.person.addresses,
			};

			return Result.Ok(supplierWithPerson);
		} catch (error) {
			return Result.Fail('Failed to find supplier: ' + (error instanceof Error ? error.message : 'Unknown'));
		}
	}

	async findByEmail(email: string): Promise<Result<SupplierWithPerson | null>> {
		try {
			const supplier = await this.prismaService.supplier.findFirst({
				where: {
					person: {
						email: email,
					},
				},
				include: {
					person: {
						include: {
							contacts: true,
							addresses: true,
						},
					},
				},
			});

			if (!supplier) {
				return Result.Ok(null);
			}

			const supplierWithPerson: SupplierWithPerson = {
				id: supplier.id,
				tradeName: supplier.tradeName ?? undefined,
				openingDate: supplier.openingDate ?? undefined,
				type: supplier.type ?? undefined,
				size: supplier.size ?? undefined,
				legalNature: supplier.legalNature ?? undefined,
				person: supplier.person,
				contacts: supplier.person.contacts,
				addresses: supplier.person.addresses,
			};

			return Result.Ok(supplierWithPerson);
		} catch (error) {
			return Result.Fail('Failed to find supplier by email: ' + (error instanceof Error ? error.message : 'Unknown'));
		}
	}

	async findByDocumentNumber(documentNumber: string): Promise<Result<SupplierWithPerson | null>> {
		try {
			const supplier = await this.prismaService.supplier.findFirst({
				where: {
					person: {
						documentNumber: documentNumber,
					},
				},
				include: {
					person: {
						include: {
							contacts: true,
							addresses: true,
						},
					},
				},
			});

			if (!supplier) {
				return Result.Ok(null);
			}

			const supplierWithPerson: SupplierWithPerson = {
				id: supplier.id,
				tradeName: supplier.tradeName ?? undefined,
				openingDate: supplier.openingDate ?? undefined,
				type: supplier.type ?? undefined,
				size: supplier.size ?? undefined,
				legalNature: supplier.legalNature ?? undefined,
				person: supplier.person,
				contacts: supplier.person.contacts,
				addresses: supplier.person.addresses,
			};

			return Result.Ok(supplierWithPerson);
		} catch (error) {
			return Result.Fail('Failed to find supplier by document number: ' + (error instanceof Error ? error.message : 'Unknown'));
		}
	}

	async update(id: number, supplier: SupplierModel): Promise<Result<SupplierWithPerson | null>> {
		const prisma = this.prismaService;

		const person = supplier.person;
		// Verifica se o ID da pessoa está presente
		if (!person?.id) {
			return Result.Fail('Person ID is required to update supplier.');
		}

		const personId = person.id; // Garantir que personId não é undefined

		try {
			// Inicia a transação para garantir que todas as operações sejam atômicas
			await prisma.$transaction(async (tx) => {
				// Atualiza os dados da pessoa
				await tx.person.update({
					where: { id: personId },
					data: {
						name: person.name,
						email: person.email,
						documentNumber: person.documentNumber,
						birthDate: person.birthDate,
						status: PersonMapper.toPrismaStatus(person.status),
						personType: PersonMapper.toPrismaPersonType(person.personType),
					},
				});

				// Atualiza os dados do fornecedor
				await tx.supplier.update({
					where: { id },
					data: {
						tradeName: supplier.tradeName,
						openingDate: supplier.openingDate,
						type: supplier.type,
						size: supplier.size,
						legalNature: supplier.legalNature,
					},
				});

				// Deleta os contatos antigos
				await tx.contact.deleteMany({
					where: { personId: personId },
				});

				// Cria os novos contatos, se houver
				if (supplier.contacts && supplier.contacts.length > 0) {
					for (const contact of supplier.contacts) {
						await tx.contact.create({
							data: {
								personId: personId,
								type: contact.type,
								value: contact.value,
								note: contact.note ?? null,
								primary: contact.primary ?? false,
								linkType: contact.linkType,
							},
						});
					}
				}

				// Deleta os endereços antigos
				await tx.address.deleteMany({
					where: { personId: personId },
				});

				// Cria os novos endereços
				const addresses = supplier.addresses ?? [];
				for (const address of addresses) {
					await tx.address.create({
						data: {
							personId: personId,
							street: address.street,
							district: address.district,
							city: address.city,
							state: address.state,
							postalCode: address.postalCode,
							linkType: address.linkType,
						},
					});
				}
			});

			// Recupera e retorna o fornecedor atualizado
			const updatedSupplier = await this.findById(id);
			return updatedSupplier;
		} catch (error) {
			// Loga o erro para ajudar na depuração
			console.error('Supplier update failed:', error);
			return Result.Fail('Failed to update supplier: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}


	async delete(id: number): Promise<Result<void>> {
		try {
			await this.prismaService.supplier.delete({
				where: { id },
			});
			return Result.Ok(undefined);
		} catch (error) {
			return Result.Fail('Failed to delete supplier: ' + (error instanceof Error ? error.message : 'Unknown'));
		}
	}
}
