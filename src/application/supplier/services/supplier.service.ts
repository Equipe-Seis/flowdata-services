import { Injectable, Inject } from '@nestjs/common';

import { CreateSupplierDto } from '@application/supplier/dto/create-supplier.dto';
import { ISupplierRepository } from '@application/supplier/persistence/isupplier.repository';
import { SupplierSummary } from '@domain/supplier/types/supplierSummary.type';
import { IPersonRepository } from '@application/person/persistence/iperson.repository';
import { SupplierMapper } from '../mappers/supplier.mapper';
import { Result } from '@domain/shared/result/result.pattern';
import { SupplierModel } from '@domain/supplier/models/supplier.model';
import { PersonMapper } from '@application/person/mappers/person.mapper';
import { ContactMapper } from '@application/person/mappers/contact.mapper';
import { AddressMapper } from '@application/person/mappers/address.mapper';
import { UpdateSupplierDto } from '@application/supplier/dto/update-supplier.dto';

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

		// Buscar o supplier completo com relacionamentos
		const supplierResult = await this.supplierRepository.findById(rawSupplier.id);
		if (supplierResult.isFailure) return Result.Fail(supplierResult.getError());

		const supplier = supplierResult.getValue();
		if (!supplier) return Result.Fail('Failed to retrieve created supplier.');

		const supplierDomainModel = SupplierMapper.toDomain(supplier);
		return Result.Ok(supplierDomainModel);
	}

	async findById(id: number): Promise<Result<SupplierModel>> {
		const supplierResult = await this.supplierRepository.findById(id);
		if (supplierResult.isFailure) return Result.Fail(supplierResult.getError());

		const supplier = supplierResult.getValue();
		if (!supplier) return Result.Fail('Supplier not found.');

		const supplierDomainModel = SupplierMapper.toDomain(supplier);
		return Result.Ok(supplierDomainModel);
	}

	async updateSupplier(id: number, dto: UpdateSupplierDto): Promise<Result<SupplierModel>> {
		const supplierResult = await this.supplierRepository.findById(id);
		if (supplierResult.isFailure) return Result.Fail(supplierResult.getError());

		const existingSupplier = supplierResult.getValue();
		if (!existingSupplier) return Result.Fail('Supplier not found.');

		const personData = PersonMapper.fromUpdateDto(dto.person);

		const supplierModel = SupplierMapper.fromDto(dto, personData);

		const updateResult = await this.supplierRepository.update(id, supplierModel);
		if (updateResult.isFailure) return Result.Fail(updateResult.getError());

		if (!existingSupplier.person.id) {
			return Result.Fail('Person ID is undefined.');
		}

		const personId = existingSupplier.person.id;

		await this.personRepository.deleteContacts(personId);
		await this.personRepository.deleteAddresses(personId);

		for (const contactDto of dto.contacts ?? []) {
			const contactModel = ContactMapper.fromDto(contactDto);
			const createContactResult = await this.personRepository.createContact(personId, contactModel);

			if (createContactResult.isFailure) {
				return Result.Fail(createContactResult.getError());
			}
		}

		for (const addressDto of dto.addresses ?? []) {
			const addressModel = AddressMapper.fromDto(addressDto);
			const createAddressResult = await this.personRepository.createAddress(personId, addressModel);

			if (createAddressResult.isFailure) {
				return Result.Fail(createAddressResult.getError());
			}
		}

		const updatedSupplier = updateResult.getValue();
		if (!updatedSupplier) return Result.Fail('Failed to update supplier.');

		return Result.Ok(SupplierMapper.toDomain(updatedSupplier));
	}

	async deleteSupplier(id: number): Promise<Result<void>> {
		const supplierResult = await this.supplierRepository.findById(id);
		if (supplierResult.isFailure) return Result.Fail(supplierResult.getError());

		const supplier = supplierResult.getValue();
		if (!supplier) return Result.Fail('Supplier not found.');

		const deleteResult = await this.supplierRepository.delete(id);
		if (deleteResult.isFailure) return Result.Fail(deleteResult.getError());

		return Result.Ok(undefined);
	}





}
