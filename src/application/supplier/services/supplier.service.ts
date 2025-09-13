import { Injectable, Inject } from '@nestjs/common';
import { CreateSupplierDto } from '@application/supplier/dto/create-supplier.dto';
import { PersonType } from '@domain/person/enums/person-type.enum';
import { Status } from '@domain/shared/enums/status.enum';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { SupplierSummary } from '@domain/supplier/types/supplierSummary.type';
import { IPersonRepository } from '@application/auth/persistence/iperson.repository';
import { SupplierMapper } from '../mappers/supplier.mapper';
import { Result } from '@domain/shared/result/result.pattern';
import { SupplierModel } from '@domain/supplier/models/supplier.model';
import { PersonModel } from '@domain/person/models/person.model';
import { PersonMapper } from '@application/person/mappers/person.mapper';
import { SupplierWithPerson } from '@domain/supplier/types/supplierPerson.type';
import { ContactMapper } from '@application/person/mappers/contact.mapper';
import { AddressMapper } from '@application/person/mappers/address.mapper';

@Injectable()
export class SupplierService {
	constructor(
		@Inject(ISupplierRepository)
		private readonly supplierRepository: ISupplierRepository,
		@Inject(IPersonRepository) private personRepository: IPersonRepository,
	) { }

	async findAll(page: number, limit: number): Promise<{ data: SupplierSummary[]; total: number }> {
		return this.supplierRepository.findAll(page, limit);
	}

	async createSupplier(dto: CreateSupplierDto): Promise<Result<SupplierModel>> {
		const personDto = dto.person;

		const existingByDocument = await this.personRepository.findByDocumentNumber(personDto.documentNumber);
		if (existingByDocument.isFailure) return Result.Fail(existingByDocument.getError());
		if (existingByDocument.getValue() != null) return Result.Forbidden('Document number is already in use.');

		if (personDto.email) {
			const existingByEmail = await this.personRepository.findByEmail(personDto.email);
			if (existingByEmail.isFailure) return Result.Fail(existingByEmail.getError());
			if (existingByEmail.getValue() != null) return Result.Forbidden('Email is already in use.');
		}

		const hasContacts = dto.contacts && dto.contacts.length > 0;
		const hasAddresses = dto.addresses && dto.addresses.length > 0;

		if (!hasContacts) {
			return Result.Fail('You must provide at least one contact.');
		}

		if (!hasContacts || !hasAddresses) {
			return Result.Fail('You must provide at least one address.');
		}

		const personData = PersonMapper.fromDto(personDto);
		const personResult = await this.personRepository.create(personData);

		if (personResult.isFailure) {
			return Result.Fail(personResult.getError());
		}

		const person = personResult.getValue()!;

		let supplierModel: SupplierModel;
		try {
			supplierModel = SupplierMapper.fromDto(dto, person);
		} catch (error) {
			return Result.Fail(error instanceof Error ? error.message : 'Unknown error creating supplier.');
		}

		if (person.id === undefined) {
			return Result.Fail('Person ID is undefined.');
		}

		const createResult = await this.supplierRepository.create(supplierModel, person.id);
		if (createResult.isFailure) return Result.Fail(createResult.getError());


		const rawSupplier = createResult.getValue();

		const contactsModels = (dto.contacts ?? []).map(ContactMapper.fromDto);
		const addressesModels = (dto.addresses ?? []).map(AddressMapper.fromDto);

		const supplierWithPerson: SupplierWithPerson = {
			id: rawSupplier.id,
			tradeName: rawSupplier.tradeName ?? undefined,
			openingDate: rawSupplier.openingDate ?? undefined,
			type: rawSupplier.type ?? undefined,
			size: rawSupplier.size ?? undefined,
			legalNature: rawSupplier.legalNature ?? undefined,
			person: {
				...person
			},
			contacts: contactsModels,
			addresses: addressesModels,
		};

		const supplierDomainModel = SupplierMapper.toDomain(supplierWithPerson);
		return Result.Ok(supplierDomainModel);
	}


}
