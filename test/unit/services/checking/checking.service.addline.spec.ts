import { Test, TestingModule } from '@nestjs/testing';
import { CheckingService } from '../../../../src/application/checking/services/checking.service';
import { ICheckingRepository } from '../../../../src/application/checking/persistence/ichecking.repository';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { CreateCheckingLineDto } from '../../../../src/application/checking/dto/create-checking-line.dto';
import { CheckingResponseDto } from '../../../../src/application/checking/dto/checking-response.dto';
import { Result } from '../../../../src/domain/shared/result/result.pattern';
import { CheckingStatus, TransferType, UnitOfMeasure } from '@prisma/client';

// Mock do CheckingMapper
jest.mock('@application/checking/mappers/checking.mapper');

describe('CheckingService addLine (TDD)', () => {
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

    describe('addLine', () => {
        it('deve adicionar linhas com sucesso quando todas pertencem ao mesmo checking', async () => {

            const checkingId = 1;
            const linesDto: CreateCheckingLineDto[] = [
                {
                    checkingId,
                    supplyItemId: 100,
                    receivedQty: 10,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
                {
                    checkingId,
                    supplyItemId: 200,
                    receivedQty: 5,
                    unitOfMeasure: UnitOfMeasure.UN,
                },
            ];

            const lineModels = [
                {
                    supplyItemId: 100,
                    receivedQty: 10,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
                {
                    supplyItemId: 200,
                    receivedQty: 5,
                    unitOfMeasure: UnitOfMeasure.UN,
                },
            ];

            const updatedChecking = {
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
                updatedChecking.receiptDate,
                CheckingStatus.draft,
                updatedChecking.createdAt,
                [],
            );


            checkingMapper.toLinesModel
                .mockReturnValueOnce(lineModels[0] as any)
                .mockReturnValueOnce(lineModels[1] as any);


            repository.addLines.mockResolvedValue(Result.Ok(updatedChecking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.addLine(linesDto);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledTimes(2);
            expect(checkingMapper.toLinesModel).toHaveBeenNthCalledWith(1, linesDto[0], 0, linesDto);
            expect(checkingMapper.toLinesModel).toHaveBeenNthCalledWith(2, linesDto[1], 1, linesDto);
            expect(repository.addLines).toHaveBeenCalledWith(checkingId, lineModels);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(updatedChecking);
        });

        it('deve adicionar uma única linha com sucesso', async () => {

            const checkingId = 1;
            const linesDto: CreateCheckingLineDto[] = [
                {
                    checkingId,
                    supplyItemId: 100,
                    receivedQty: 15,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
            ];

            const lineModel = {
                supplyItemId: 100,
                receivedQty: 15,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const updatedChecking = {
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
                        receivedQty: 15,
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
                updatedChecking.receiptDate,
                CheckingStatus.draft,
                updatedChecking.createdAt,
                [],
            );


            checkingMapper.toLinesModel.mockReturnValue(lineModel as any);


            repository.addLines.mockResolvedValue(Result.Ok(updatedChecking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.addLine(linesDto);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledWith(linesDto[0], 0, linesDto);
            expect(repository.addLines).toHaveBeenCalledWith(checkingId, [lineModel]);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(updatedChecking);
        });

        it('deve retornar erro quando linhas pertencem a checkings diferentes', async () => {
            const linesDto: CreateCheckingLineDto[] = [
                {
                    checkingId: 1,
                    supplyItemId: 100,
                    receivedQty: 10,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
                {
                    checkingId: 2, // Diferente do primeiro
                    supplyItemId: 200,
                    receivedQty: 5,
                    unitOfMeasure: UnitOfMeasure.UN,
                },
            ];


            const result = await service.addLine(linesDto);


            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Todas as linhas devem pertencer ao mesmo recebimento.');
            expect(checkingMapper.toLinesModel).not.toHaveBeenCalled();
            expect(repository.addLines).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando array de linhas está vazio', async () => {

            const linesDto: CreateCheckingLineDto[] = [];


            await expect(service.addLine(linesDto)).rejects.toThrow();
            expect(checkingMapper.toLinesModel).not.toHaveBeenCalled();
            expect(repository.addLines).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository falha', async () => {

            const checkingId = 1;
            const linesDto: CreateCheckingLineDto[] = [
                {
                    checkingId,
                    supplyItemId: 100,
                    receivedQty: 10,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
            ];

            const lineModel = {
                supplyItemId: 100,
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const repositoryError = 'Erro ao adicionar linhas no banco de dados';

            checkingMapper.toLinesModel.mockReturnValue(lineModel as any);


            repository.addLines.mockResolvedValue(Result.Fail(repositoryError));


            const result = await service.addLine(linesDto);


            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledWith(linesDto[0], 0, linesDto);
            expect(repository.addLines).toHaveBeenCalledWith(checkingId, [lineModel]);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {

            const checkingId = 1;
            const linesDto: CreateCheckingLineDto[] = [
                {
                    checkingId,
                    supplyItemId: 100,
                    receivedQty: 10,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
            ];

            const mapperError = new Error('Erro no mapper');


            checkingMapper.toLinesModel.mockImplementation(() => {
                throw mapperError;
            });


            await expect(service.addLine(linesDto)).rejects.toThrow(mapperError);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledWith(linesDto[0], 0, linesDto);
            expect(repository.addLines).not.toHaveBeenCalled();
        });

        it('deve validar que todas as linhas têm o mesmo checkingId mesmo com valores diferentes', async () => {

            const linesDto: CreateCheckingLineDto[] = [
                {
                    checkingId: 1,
                    supplyItemId: 100,
                    receivedQty: 10,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
                {
                    checkingId: 1, // Mesmo ID, mas pode ser string vs number
                    supplyItemId: 200,
                    receivedQty: 5,
                    unitOfMeasure: UnitOfMeasure.UN,
                },
            ];

            const lineModels = [
                {
                    supplyItemId: 100,
                    receivedQty: 10,
                    unitOfMeasure: UnitOfMeasure.KG,
                },
                {
                    supplyItemId: 200,
                    receivedQty: 5,
                    unitOfMeasure: UnitOfMeasure.UN,
                },
            ];

            const updatedChecking = {
                id: 1,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const expectedResponse = new CheckingResponseDto(
                1,
                updatedChecking.receiptDate,
                CheckingStatus.draft,
                updatedChecking.createdAt,
                [],
            );


            checkingMapper.toLinesModel
                .mockReturnValueOnce(lineModels[0] as any)
                .mockReturnValueOnce(lineModels[1] as any);


            repository.addLines.mockResolvedValue(Result.Ok(updatedChecking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.addLine(linesDto);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.addLines).toHaveBeenCalledWith(1, lineModels);
        });
    });


});
