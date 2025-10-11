import { Test, TestingModule } from '@nestjs/testing';
import { CheckingService } from '../../../../src/application/checking/services/checking.service';
import { ICheckingRepository } from '../../../../src/application/checking/persistence/ichecking.repository';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { CheckingResponseDto } from '../../../../src/application/checking/dto/checking-response.dto';
import { Result } from '../../../../src/domain/shared/result/result.pattern';
import { CheckingStatus, TransferType, UnitOfMeasure } from '@prisma/client';

jest.mock('@application/checking/mappers/checking.mapper');

describe('CheckingService finds (TDD)', () => {
    let service: CheckingService;
    let repository: jest.Mocked<ICheckingRepository>;
    let checkingMapper: jest.Mocked<typeof CheckingMapper>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CheckingService,
                {
                    provide: ICheckingRepository,
                    useValue: {
                        create: jest.fn(),
                        delete: jest.fn(),
                        updateCheckingStatus: jest.fn(),
                        findById: jest.fn(),
                        findAll: jest.fn(),
                        addLines: jest.fn(),
                        deleteLine: jest.fn(),
                        updateLine: jest.fn(),
                        findTransferById: jest.fn(),
                        createTransfer: jest.fn(),
                        createTransferLines: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CheckingService>(CheckingService);
        repository = module.get(ICheckingRepository);
        checkingMapper = CheckingMapper as jest.Mocked<typeof CheckingMapper>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('deve retornar um checking quando encontrado', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [
                    {
                        id: 1,
                        checkingId,
                        supplyItemId: 100,
                        receivedQty: 10,
                        unitOfMeasure: UnitOfMeasure.KG,
                        supplyItem: {
                            id: 100,
                            name: 'Item 1',
                            code: 'ITEM001',
                            description: 'Descrição do item 1',
                        },
                    },
                ],
            };

            const expectedResponse = new CheckingResponseDto(
                checkingId,
                checking.receiptDate,
                CheckingStatus.draft,
                checking.createdAt,
                [],
            );


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.findById(checkingId);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar NotFound quando checking não é encontrado', async () => {

            const checkingId = 999;


            repository.findById.mockResolvedValue(Result.Ok(null));


            const result = await service.findById(checkingId);


            expect(result.isFailure).toBe(true);
            const err0 = result.getError() as any;
            expect(err0 instanceof Error ? err0.message : err0).toBe(`Não foram encontrados recebimentos para o Id ${checkingId}`);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository falha', async () => {

            const checkingId = 1;
            const repositoryError = 'Erro ao conectar com o banco de dados';


            repository.findById.mockResolvedValue(Result.Fail(repositoryError));


            const result = await service.findById(checkingId);


            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const mapperError = new Error('Erro no mapper');


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            checkingMapper.fromEntity.mockImplementation(() => {
                throw mapperError;
            });


            await expect(service.findById(checkingId)).rejects.toThrow(mapperError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking com status received', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.received,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const expectedResponse = new CheckingResponseDto(
                checkingId,
                checking.receiptDate,
                CheckingStatus.received,
                checking.createdAt,
                [],
            );


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.findById(checkingId);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking com status cancelled', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.cancelled,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const expectedResponse = new CheckingResponseDto(
                checkingId,
                checking.receiptDate,
                CheckingStatus.cancelled,
                checking.createdAt,
                [],
            );


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.findById(checkingId);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking com múltiplas linhas', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [
                    {
                        id: 1,
                        checkingId,
                        supplyItemId: 100,
                        receivedQty: 10,
                        unitOfMeasure: UnitOfMeasure.KG,
                        supplyItem: {
                            id: 100,
                            name: 'Item 1',
                            code: 'ITEM001',
                            description: 'Descrição do item 1',
                        },
                    },
                    {
                        id: 2,
                        checkingId,
                        supplyItemId: 200,
                        receivedQty: 5,
                        unitOfMeasure: UnitOfMeasure.UN,
                        supplyItem: {
                            id: 200,
                            name: 'Item 2',
                            code: 'ITEM002',
                            description: 'Descrição do item 2',
                        },
                    },
                ],
            };

            const expectedResponse = new CheckingResponseDto(
                checkingId,
                checking.receiptDate,
                CheckingStatus.draft,
                checking.createdAt,
                [],
            );


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.findById(checkingId);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking sem linhas', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const expectedResponse = new CheckingResponseDto(
                checkingId,
                checking.receiptDate,
                CheckingStatus.draft,
                checking.createdAt,
                [],
            );


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.findById(checkingId);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });
    });

    describe('findAll', () => {
        it('deve retornar lista de checkings quando existem dados', async () => {

            const checkings = [
                {
                    id: 1,
                    receiptDate: new Date('2024-01-15T10:00:00Z'),
                    status: CheckingStatus.draft,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
                {
                    id: 2,
                    receiptDate: new Date('2024-01-16T10:00:00Z'),
                    status: CheckingStatus.received,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
            ];

            const expectedResponses = [
                new CheckingResponseDto(
                    1,
                    checkings[0].receiptDate,
                    CheckingStatus.draft,
                    checkings[0].createdAt,
                    [],
                ),
                new CheckingResponseDto(
                    2,
                    checkings[1].receiptDate,
                    CheckingStatus.received,
                    checkings[1].createdAt,
                    [],
                ),
            ];


            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));


            checkingMapper.fromEntity
                .mockReturnValueOnce(expectedResponses[0])
                .mockReturnValueOnce(expectedResponses[1]);


            const result = await service.findAll();


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponses);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(2);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(1, checkings[0], 0, checkings as any);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(2, checkings[1], 1, checkings as any);
        });

        it('deve retornar NoContent quando não existem checkings', async () => {

            const emptyCheckings: any[] = [];


            repository.findAll.mockResolvedValue(Result.Ok(emptyCheckings));

            const result = await service.findAll();

            expect(result.isSuccess).toBe(true);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar NoContent quando repository retorna null', async () => {

            repository.findAll.mockResolvedValue(Result.Ok(null as any));


            const result = await service.findAll();


            expect(result.isSuccess).toBe(true);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository falha', async () => {

            const repositoryError = 'Erro ao conectar com o banco de dados';


            repository.findAll.mockResolvedValue(Result.Fail(repositoryError));


            const result = await service.findAll();


            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {

            const checkings = [
                {
                    id: 1,
                    receiptDate: new Date('2024-01-15T10:00:00Z'),
                    status: CheckingStatus.draft,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
            ];

            const mapperError = new Error('Erro no mapper');


            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));


            checkingMapper.fromEntity.mockImplementation(() => {
                throw mapperError;
            });


            await expect(service.findAll()).rejects.toThrow(mapperError);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checkings[0], 0, checkings as any);
        });

        it('deve retornar lista com checkings de diferentes status', async () => {

            const checkings = [
                {
                    id: 1,
                    receiptDate: new Date('2024-01-15T10:00:00Z'),
                    status: CheckingStatus.draft,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
                {
                    id: 2,
                    receiptDate: new Date('2024-01-16T10:00:00Z'),
                    status: CheckingStatus.received,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
                {
                    id: 3,
                    receiptDate: new Date('2024-01-17T10:00:00Z'),
                    status: CheckingStatus.cancelled,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
            ];

            const expectedResponses = [
                new CheckingResponseDto(1, checkings[0].receiptDate, CheckingStatus.draft, checkings[0].createdAt, []),
                new CheckingResponseDto(2, checkings[1].receiptDate, CheckingStatus.received, checkings[1].createdAt, []),
                new CheckingResponseDto(3, checkings[2].receiptDate, CheckingStatus.cancelled, checkings[2].createdAt, []),
            ];


            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));


            checkingMapper.fromEntity
                .mockReturnValueOnce(expectedResponses[0])
                .mockReturnValueOnce(expectedResponses[1])
                .mockReturnValueOnce(expectedResponses[2]);


            const result = await service.findAll();


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponses);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(3);
        });

        it('deve retornar lista com checkings que têm linhas', async () => {

            const checkings = [
                {
                    id: 1,
                    receiptDate: new Date('2024-01-15T10:00:00Z'),
                    status: CheckingStatus.draft,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [
                        {
                            id: 1,
                            checkingId: 1,
                            supplyItemId: 100,
                            receivedQty: 10,
                            unitOfMeasure: UnitOfMeasure.KG,
                            supplyItem: {
                                id: 100,
                                name: 'Item 1',
                                code: 'ITEM001',
                                description: 'Descrição do item 1',
                            },
                        },
                    ],
                },
                {
                    id: 2,
                    receiptDate: new Date('2024-01-16T10:00:00Z'),
                    status: CheckingStatus.received,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
            ];

            const expectedResponses = [
                new CheckingResponseDto(1, checkings[0].receiptDate, CheckingStatus.draft, checkings[0].createdAt, []),
                new CheckingResponseDto(2, checkings[1].receiptDate, CheckingStatus.received, checkings[1].createdAt, []),
            ];


            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));


            checkingMapper.fromEntity
                .mockReturnValueOnce(expectedResponses[0])
                .mockReturnValueOnce(expectedResponses[1]);


            const result = await service.findAll();


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponses);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(2);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(1, checkings[0], 0, checkings as any);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(2, checkings[1], 1, checkings as any);
        });

        it('deve retornar lista com um único checking', async () => {

            const checkings = [
                {
                    id: 1,
                    receiptDate: new Date('2024-01-15T10:00:00Z'),
                    status: CheckingStatus.draft,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lines: [],
                },
            ];

            const expectedResponse = new CheckingResponseDto(
                1,
                checkings[0].receiptDate,
                CheckingStatus.draft,
                checkings[0].createdAt,
                [],
            );


            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.findAll();


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual([expectedResponse]);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(1);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checkings[0], 0, checkings as any);
        });
    });



});
