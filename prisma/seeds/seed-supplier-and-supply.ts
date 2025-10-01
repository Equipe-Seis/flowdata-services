import { PrismaClient } from "@prisma/client";

export async function seedSuppliersAndSupplyItems(prisma: PrismaClient) {
	try {
		const supplier = await prisma.supplier.create({
			data: {
				tradeName: 'Fornecedor de maçã',
				openingDate: new Date('2020-01-01'),
				type: 'DISTRIBUIDOR',
				size: 'MEDIA',
				legalNature: 'LTDA',
				person: {
					create: {
						name: 'Fornecedor Exemplo LTDA',
						personType: 'legalentity',
						documentNumber: '12348988000195',
						email: 'contato@gmail.com',
						birthDate: new Date('2020-01-01'),
						status: 'active',
						contacts: {
							create: [
								{
									type: 'phone',
									value: '(11) 99999-9999',
									linkType: 'supplier',
									primary: true,
									note: 'Telefone principal',
								},
								{
									type: 'email',
									value: 'contato@fornecedor.com',
									linkType: 'supplier',
									primary: true,
									note: 'Email principal',
								},
							],
						},
						addresses: {
							create: [
								{
									street: 'Rua das Flores, 123',
									district: 'Centro',
									city: 'São Paulo',
									state: 'SP',
									postalCode: '01234-567',
									linkType: 'supplier',
								},
							],
						},
					},
				},
			},
		});

		console.log('Supplier created with ID:', supplier.id);

		const supplyItem = await prisma.supplyItem.create({
			data: {
				name: 'Maçã pra fazer suco',
				code: '123456',
				description: 'Faz suco doce',
				price: 1.0,
				unitOfMeasure: 'KG',
				supplier: {
					connect: { id: supplier.id },
				},
			},
		});

		console.log('SupplyItem created with ID:', supplyItem.id);
	} catch (error) {
		console.error('Error seeding suppliers and supply items:', error);
	} finally {
		await prisma.$disconnect();
	}
}
