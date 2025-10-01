import { Test, TestingModule } from '@nestjs/testing';
import { CheckingService } from '../../../../src/application/checking/services/checking.service';
import { ICheckingRepository } from '../../../../src/application/checking/persistence/ichecking.repository';
import { CheckingMapper } from '../../../../src/application/checking/mappers/checking.mapper';
import { CreateCheckingDto } from '../../../../src/application/checking/dto/create-checking.dto';
import { CreateCheckingLineDto } from '../../../../src/application/checking/dto/create-checking-line.dto';
import { UpdateCheckingLineDto } from '../../../../src/application/checking/dto/update-checking-line.dto';
import { CheckingResponseDto } from '../../../../src/application/checking/dto/checking-response.dto';
import { CreateTransferResponseDto } from '../../../../src/application/checking/dto/create-transfer-response.dto';
import { Result } from '../../../../src/domain/shared/result/result.pattern';
import { CheckingStatus, TransferType, UnitOfMeasure } from '@prisma/client';

// Mock do CheckingMapper
jest.mock('../../../../src/application/checking/mappers/checking.mapper');

describe('CheckingService (TDD)', () => {
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

    describe('create', () => {
        it('deve criar um checking com sucesso quando dados válidos são fornecidos', async () => {
            // Arrange
            const receiptDate = new Date('2024-01-15T10:00:00Z');
            const createDto: CreateCheckingDto = {
                receiptDate,
            };

            const checkingModel = {
                receiptDate,
            };

            const createdEntity = {
                id: 1,
                receiptDate,
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const expectedResponse = new CheckingResponseDto(
                1,
                receiptDate,
                CheckingStatus.draft,
                createdEntity.createdAt,
                [],
            );

            // Mock do mapper
            checkingMapper.toModel.mockReturnValue(checkingModel as any);
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Mock do repository
            repository.create.mockResolvedValue(Result.Ok(createdEntity as any));

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).toHaveBeenCalledWith(checkingModel);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(createdEntity);
        });

        it('deve criar um checking sem data de recebimento (usa data atual)', async () => {
            // Arrange
            const createDto: CreateCheckingDto = {};

            const checkingModel = {
                receiptDate: undefined,
            };

            const createdEntity = {
                id: 2,
                receiptDate: new Date(),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const expectedResponse = new CheckingResponseDto(
                2,
                createdEntity.receiptDate,
                CheckingStatus.draft,
                createdEntity.createdAt,
                [],
            );

            // Mock do mapper
            checkingMapper.toModel.mockReturnValue(checkingModel as any);
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Mock do repository
            repository.create.mockResolvedValue(Result.Ok(createdEntity as any));

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).toHaveBeenCalledWith(checkingModel);
        });

        it('deve retornar erro quando o repository falha', async () => {
            // Arrange
            const createDto: CreateCheckingDto = {
                receiptDate: new Date('2024-01-15T10:00:00Z'),
            };

            const checkingModel = {
                receiptDate: createDto.receiptDate,
            };

            const repositoryError = 'Erro ao conectar com o banco de dados';

            // Mock do mapper
            checkingMapper.toModel.mockReturnValue(checkingModel as any);

            // Mock do repository retornando erro
            repository.create.mockResolvedValue(Result.Fail(repositoryError));

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).toHaveBeenCalledWith(checkingModel);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {
            // Arrange
            const createDto: CreateCheckingDto = {
                receiptDate: new Date('2024-01-15T10:00:00Z'),
            };

            const mapperError = new Error('Erro no mapper');

            // Mock do mapper lançando exceção
            checkingMapper.toModel.mockImplementation(() => {
                throw mapperError;
            });

            // Act & Assert
            await expect(service.create(createDto)).rejects.toThrow(mapperError);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).not.toHaveBeenCalled();
        });
    });

    describe('revertChecking', () => {
        it('deve reverter um recebimento com sucesso quando status é received e tem linhas', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.received,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [
                    {
                        id: 1,
                        checkingId,
                        supplyItemId: 100,
                        receivedQty: 10,
                        unitOfMeasure: 'KG',
                    },
                    {
                        id: 2,
                        checkingId,
                        supplyItemId: 200,
                        receivedQty: 5,
                        unitOfMeasure: 'UN',
                    },
                ],
            };

            const transfer = {
                id: 1,
                transferType: TransferType.outbound,
                createdAt: new Date(),
                updatedAt: new Date(),
                inventTransferLines: [],
            };

            const transferWithLines = {
                ...transfer,
                inventTransferLines: [
                    {
                        id: 1,
                        transferQty: 10,
                        unitOfMeasure: 'KG',
                        supplyItemId: 100,
                        checkingLineId: 1,
                    },
                    {
                        id: 2,
                        transferQty: 5,
                        unitOfMeasure: 'UN',
                        supplyItemId: 200,
                        checkingLineId: 2,
                    },
                ],
            };

            const expectedResponse = new CreateTransferResponseDto(
                1,
                TransferType.outbound,
                [],
            );

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do createTransfer
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));

            // Mock do mapper para linhas
            checkingMapper.toInventTransferLineModel
                .mockReturnValueOnce({
                    transferQty: 10,
                    unitOfMeasure: 'KG',
                    supplyItemId: 100,
                    checkingLineId: 1,
                } as any)
                .mockReturnValueOnce({
                    transferQty: 5,
                    unitOfMeasure: 'UN',
                    supplyItemId: 200,
                    checkingLineId: 2,
                } as any);

            // Mock do createTransferLines
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));

            // Mock do updateCheckingStatus
            repository.updateCheckingStatus.mockResolvedValue(Result.Ok(checking as any));

            // Mock do findTransferById
            repository.findTransferById.mockResolvedValue(Result.Ok(transferWithLines as any));

            // Mock do mapper para response
            checkingMapper.toCreateTransferResponseDto.mockReturnValue(expectedResponse);

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).toHaveBeenCalledWith({
                transferType: TransferType.outbound,
            });
            expect(repository.createTransferLines).toHaveBeenCalledWith(1, expect.any(Array));
            expect(repository.updateCheckingStatus).toHaveBeenCalledWith(checkingId, CheckingStatus.cancelled);
            expect(repository.findTransferById).toHaveBeenCalledWith(1);
            expect(checkingMapper.toCreateTransferResponseDto).toHaveBeenCalledWith(transferWithLines);
        });

        it('deve retornar erro quando checking não é encontrado', async () => {
            // Arrange
            const checkingId = 999;
            const notFoundError = `Não foram encontrados recebimentos para o Id ${checkingId}`;

            repository.findById.mockResolvedValue(Result.NotFound(notFoundError));

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(notFoundError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não está em status received', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.draft,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(
                `Não é possivel reverter o recebimento ${checkingId} no status ${CheckingStatus.draft}`
            );
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não tem linhas', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [],
            };

            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(
                `Não é possivel reverter o recebimento ${checkingId} com 0 linhas`
            );
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando createTransfer falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transferError = 'Erro ao criar transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Fail(transferError));

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(transferError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).toHaveBeenCalledWith({
                transferType: TransferType.outbound,
            });
            expect(repository.createTransferLines).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando createTransferLines falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transfer = { id: 1, transferType: TransferType.outbound };
            const linesError = 'Erro ao criar linhas da transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Fail(linesError));

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(linesError);
            expect(repository.createTransferLines).toHaveBeenCalled();
            expect(repository.updateCheckingStatus).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando updateCheckingStatus falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transfer = { id: 1, transferType: TransferType.outbound };
            const transferWithLines = { ...transfer, inventTransferLines: [] };
            const statusError = 'Erro ao atualizar status';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));
            repository.updateCheckingStatus.mockResolvedValue(Result.Fail(statusError));

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(`Falha ao atualizar o status do recebimento: ${statusError}`);
            expect(repository.updateCheckingStatus).toHaveBeenCalledWith(checkingId, CheckingStatus.cancelled);
            expect(repository.findTransferById).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando findTransferById falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transfer = { id: 1, transferType: TransferType.outbound };
            const transferWithLines = { ...transfer, inventTransferLines: [] };
            const findError = 'Erro ao buscar transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));
            repository.updateCheckingStatus.mockResolvedValue(Result.Ok(checking as any));
            repository.findTransferById.mockResolvedValue(Result.Fail(findError));

            // Act
            const result = await service.revertChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(`Transferência criada, mas ocorreu um erro ao buscar os dados finais: ${findError}`);
            expect(repository.findTransferById).toHaveBeenCalledWith(1);
            expect(checkingMapper.toCreateTransferResponseDto).not.toHaveBeenCalled();
        });
    });

    describe('concludeChecking', () => {
        it('deve concluir um recebimento com sucesso quando status é draft e tem linhas', async () => {
            // Arrange
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
                        unitOfMeasure: 'KG',
                    },
                    {
                        id: 2,
                        checkingId,
                        supplyItemId: 200,
                        receivedQty: 5,
                        unitOfMeasure: 'UN',
                    },
                ],
            };

            const transfer = {
                id: 1,
                transferType: TransferType.inbound,
                createdAt: new Date(),
                updatedAt: new Date(),
                inventTransferLines: [],
            };

            const transferWithLines = {
                ...transfer,
                inventTransferLines: [
                    {
                        id: 1,
                        transferQty: 10,
                        unitOfMeasure: 'KG',
                        supplyItemId: 100,
                        checkingLineId: 1,
                    },
                    {
                        id: 2,
                        transferQty: 5,
                        unitOfMeasure: 'UN',
                        supplyItemId: 200,
                        checkingLineId: 2,
                    },
                ],
            };

            const expectedResponse = new CreateTransferResponseDto(
                1,
                TransferType.inbound,
                [],
            );

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do createTransfer
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));

            // Mock do mapper para linhas
            checkingMapper.toInventTransferLineModel
                .mockReturnValueOnce({
                    transferQty: 10,
                    unitOfMeasure: 'KG',
                    supplyItemId: 100,
                    checkingLineId: 1,
                } as any)
                .mockReturnValueOnce({
                    transferQty: 5,
                    unitOfMeasure: 'UN',
                    supplyItemId: 200,
                    checkingLineId: 2,
                } as any);

            // Mock do createTransferLines
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));

            // Mock do updateCheckingStatus
            repository.updateCheckingStatus.mockResolvedValue(Result.Ok(checking as any));

            // Mock do findTransferById
            repository.findTransferById.mockResolvedValue(Result.Ok(transferWithLines as any));

            // Mock do mapper para response
            checkingMapper.toCreateTransferResponseDto.mockReturnValue(expectedResponse);

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).toHaveBeenCalledWith({
                transferType: TransferType.inbound,
            });
            expect(repository.createTransferLines).toHaveBeenCalledWith(1, expect.any(Array));
            expect(repository.updateCheckingStatus).toHaveBeenCalledWith(checkingId, CheckingStatus.received);
            expect(repository.findTransferById).toHaveBeenCalledWith(1);
            expect(checkingMapper.toCreateTransferResponseDto).toHaveBeenCalledWith(transferWithLines);
        });

        it('deve retornar erro quando checking não é encontrado', async () => {
            // Arrange
            const checkingId = 999;
            const notFoundError = `Não foram encontrados recebimentos para o Id ${checkingId}`;

            repository.findById.mockResolvedValue(Result.NotFound(notFoundError));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(notFoundError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não está em status draft', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(
                `Não é possivel processar o recebimento ${checkingId} no status ${CheckingStatus.received}`
            );
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não tem linhas', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.draft,
                lines: [],
            };

            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(
                `Não é possivel processar o recebimento ${checkingId} com 0 linhas`
            );
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando createTransfer falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.draft,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transferError = 'Erro ao criar transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Fail(transferError));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(transferError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).toHaveBeenCalledWith({
                transferType: TransferType.inbound,
            });
            expect(repository.createTransferLines).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando createTransferLines falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.draft,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transfer = { id: 1, transferType: TransferType.inbound };
            const linesError = 'Erro ao criar linhas da transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Fail(linesError));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(linesError);
            expect(repository.createTransferLines).toHaveBeenCalled();
            expect(repository.updateCheckingStatus).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando updateCheckingStatus falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.draft,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transfer = { id: 1, transferType: TransferType.inbound };
            const transferWithLines = { ...transfer, inventTransferLines: [] };
            const statusError = 'Erro ao atualizar status';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));
            repository.updateCheckingStatus.mockResolvedValue(Result.Fail(statusError));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(`Falha ao atualizar o status do recebimento: ${statusError}`);
            expect(repository.updateCheckingStatus).toHaveBeenCalledWith(checkingId, CheckingStatus.received);
            expect(repository.findTransferById).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando findTransferById falha', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.draft,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transfer = { id: 1, transferType: TransferType.inbound };
            const transferWithLines = { ...transfer, inventTransferLines: [] };
            const findError = 'Erro ao buscar transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));
            repository.updateCheckingStatus.mockResolvedValue(Result.Ok(checking as any));
            repository.findTransferById.mockResolvedValue(Result.Fail(findError));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(`Transferência criada, mas ocorreu um erro ao buscar os dados finais: ${findError}`);
            expect(repository.findTransferById).toHaveBeenCalledWith(1);
            expect(checkingMapper.toCreateTransferResponseDto).not.toHaveBeenCalled();
        });

        it('deve rejeitar conclusão quando checking está em status cancelled', async () => {
            // Arrange
            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.cancelled,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Act
            const result = await service.concludeChecking(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(
                `Não é possivel processar o recebimento ${checkingId} no status ${CheckingStatus.cancelled}`
            );
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });
    });

    describe('addLine', () => {
        it('deve adicionar linhas com sucesso quando todas pertencem ao mesmo checking', async () => {
            // Arrange
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

            // Mock do mapper
            checkingMapper.toLinesModel
                .mockReturnValueOnce(lineModels[0] as any)
                .mockReturnValueOnce(lineModels[1] as any);

            // Mock do repository
            repository.addLines.mockResolvedValue(Result.Ok(updatedChecking as any));

            // Mock do mapper para response
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.addLine(linesDto);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledTimes(2);
            expect(checkingMapper.toLinesModel).toHaveBeenNthCalledWith(1, linesDto[0]);
            expect(checkingMapper.toLinesModel).toHaveBeenNthCalledWith(2, linesDto[1]);
            expect(repository.addLines).toHaveBeenCalledWith(checkingId, lineModels);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(updatedChecking);
        });

        it('deve adicionar uma única linha com sucesso', async () => {
            // Arrange
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

            // Mock do mapper
            checkingMapper.toLinesModel.mockReturnValue(lineModel as any);

            // Mock do repository
            repository.addLines.mockResolvedValue(Result.Ok(updatedChecking as any));

            // Mock do mapper para response
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.addLine(linesDto);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledWith(linesDto[0]);
            expect(repository.addLines).toHaveBeenCalledWith(checkingId, [lineModel]);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(updatedChecking);
        });

        it('deve retornar erro quando linhas pertencem a checkings diferentes', async () => {
            // Arrange
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

            // Act
            const result = await service.addLine(linesDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Todas as linhas devem pertencer ao mesmo recebimento.');
            expect(checkingMapper.toLinesModel).not.toHaveBeenCalled();
            expect(repository.addLines).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando array de linhas está vazio', async () => {
            // Arrange
            const linesDto: CreateCheckingLineDto[] = [];

            // Act & Assert
            await expect(service.addLine(linesDto)).rejects.toThrow();
            expect(checkingMapper.toLinesModel).not.toHaveBeenCalled();
            expect(repository.addLines).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository falha', async () => {
            // Arrange
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

            // Mock do mapper
            checkingMapper.toLinesModel.mockReturnValue(lineModel as any);

            // Mock do repository retornando erro
            repository.addLines.mockResolvedValue(Result.Fail(repositoryError));

            // Act
            const result = await service.addLine(linesDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledWith(linesDto[0]);
            expect(repository.addLines).toHaveBeenCalledWith(checkingId, [lineModel]);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {
            // Arrange
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

            // Mock do mapper lançando exceção
            checkingMapper.toLinesModel.mockImplementation(() => {
                throw mapperError;
            });

            // Act & Assert
            await expect(service.addLine(linesDto)).rejects.toThrow(mapperError);
            expect(checkingMapper.toLinesModel).toHaveBeenCalledWith(linesDto[0]);
            expect(repository.addLines).not.toHaveBeenCalled();
        });

        it('deve validar que todas as linhas têm o mesmo checkingId mesmo com valores diferentes', async () => {
            // Arrange
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

            // Mock do mapper
            checkingMapper.toLinesModel
                .mockReturnValueOnce(lineModels[0] as any)
                .mockReturnValueOnce(lineModels[1] as any);

            // Mock do repository
            repository.addLines.mockResolvedValue(Result.Ok(updatedChecking as any));

            // Mock do mapper para response
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.addLine(linesDto);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.addLines).toHaveBeenCalledWith(1, lineModels);
        });
    });

    describe('deleteLine', () => {
        it('deve deletar uma linha com sucesso quando checkingId e lineId são válidos', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;

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

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do deleteLine
            repository.deleteLine.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper para response
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).toHaveBeenCalledWith(checkingId, lineId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar erro quando checkingId é inválido (0)', async () => {
            // Arrange
            const checkingId = 0;
            const lineId = 1;

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checkingId é inválido (null)', async () => {
            // Arrange
            const checkingId = null as any;
            const lineId = 1;

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checkingId é inválido (undefined)', async () => {
            // Arrange
            const checkingId = undefined as any;
            const lineId = 1;

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (0)', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 0;

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (null)', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = null as any;

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (undefined)', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = undefined as any;

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não é encontrado', async () => {
            // Arrange
            const checkingId = 999;
            const lineId = 1;
            const notFoundError = `Não foram encontrados recebimentos para o Id ${checkingId}`;

            repository.findById.mockResolvedValue(Result.NotFound(notFoundError));

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(notFoundError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository deleteLine falha', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;

            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const deleteError = 'Erro ao deletar linha no banco de dados';

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do deleteLine retornando erro
            repository.deleteLine.mockResolvedValue(Result.Fail(deleteError));

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(deleteError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).toHaveBeenCalledWith(checkingId, lineId);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando findById falha com erro interno', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const internalError = 'Erro interno do banco de dados';

            repository.findById.mockResolvedValue(Result.Fail(internalError));

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(internalError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;

            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const mapperError = new Error('Erro no mapper');

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do deleteLine
            repository.deleteLine.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper lançando exceção
            checkingMapper.fromEntity.mockImplementation(() => {
                throw mapperError;
            });

            // Act & Assert
            await expect(service.deleteLine(checkingId, lineId)).rejects.toThrow(mapperError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).toHaveBeenCalledWith(checkingId, lineId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve validar parâmetros com valores negativos', async () => {
            // Arrange
            const checkingId = -1;
            const lineId = -2;

            // Act
            const result = await service.deleteLine(checkingId, lineId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });
    });

    describe('updateLine', () => {
        it('deve atualizar uma linha com sucesso quando parâmetros são válidos', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 15,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [
                    {
                        id: lineId,
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

            const updateModel = {
                receivedQty: 15,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const expectedResponse = new CheckingResponseDto(
                checkingId,
                checking.receiptDate,
                CheckingStatus.draft,
                checking.createdAt,
                [],
            );

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.toUpdateLinesModel.mockReturnValue(updateModel as any);

            // Mock do updateLine
            repository.updateLine.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper para response
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.toUpdateLinesModel).toHaveBeenCalledWith(updateDto);
            expect(repository.updateLine).toHaveBeenCalledWith(checkingId, lineId, updateModel);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar erro quando checkingId é inválido (0)', async () => {
            // Arrange
            const checkingId = 0;
            const lineId = 1;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checkingId é inválido (null)', async () => {
            // Arrange
            const checkingId = null as any;
            const lineId = 1;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checkingId é inválido (undefined)', async () => {
            // Arrange
            const checkingId = undefined as any;
            const lineId = 1;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (0)', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 0;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (null)', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = null as any;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (undefined)', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = undefined as any;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não é encontrado', async () => {
            // Arrange
            const checkingId = 999;
            const lineId = 1;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };
            const notFoundError = `Não foram encontrados recebimentos para o Id ${checkingId}`;

            repository.findById.mockResolvedValue(Result.NotFound(notFoundError));

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(notFoundError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository updateLine falha', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 15,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const updateModel = {
                receivedQty: 15,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const updateError = 'Erro ao atualizar linha no banco de dados';

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.toUpdateLinesModel.mockReturnValue(updateModel as any);

            // Mock do updateLine retornando erro
            repository.updateLine.mockResolvedValue(Result.Fail(updateError));

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(updateError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.toUpdateLinesModel).toHaveBeenCalledWith(updateDto);
            expect(repository.updateLine).toHaveBeenCalledWith(checkingId, lineId, updateModel);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando findById falha com erro interno', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };
            const internalError = 'Erro interno do banco de dados';

            repository.findById.mockResolvedValue(Result.Fail(internalError));

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(internalError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper toUpdateLinesModel falha', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const mapperError = new Error('Erro no mapper toUpdateLinesModel');

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper lançando exceção
            checkingMapper.toUpdateLinesModel.mockImplementation(() => {
                throw mapperError;
            });

            // Act & Assert
            await expect(service.updateLine(checkingId, lineId, updateDto)).rejects.toThrow(mapperError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.toUpdateLinesModel).toHaveBeenCalledWith(updateDto);
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper fromEntity falha', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 15,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            const updateModel = {
                receivedQty: 15,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            const mapperError = new Error('Erro no mapper fromEntity');

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.toUpdateLinesModel.mockReturnValue(updateModel as any);

            // Mock do updateLine
            repository.updateLine.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper lançando exceção
            checkingMapper.fromEntity.mockImplementation(() => {
                throw mapperError;
            });

            // Act & Assert
            await expect(service.updateLine(checkingId, lineId, updateDto)).rejects.toThrow(mapperError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.toUpdateLinesModel).toHaveBeenCalledWith(updateDto);
            expect(repository.updateLine).toHaveBeenCalledWith(checkingId, lineId, updateModel);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve validar parâmetros com valores negativos', async () => {
            // Arrange
            const checkingId = -1;
            const lineId = -2;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 10,
                unitOfMeasure: UnitOfMeasure.KG,
            };

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.updateLine).not.toHaveBeenCalled();
        });

        it('deve atualizar linha com diferentes unidades de medida', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const updateDto: UpdateCheckingLineDto = {
                receivedQty: 25,
                unitOfMeasure: UnitOfMeasure.UN,
            };

            const checking = {
                id: checkingId,
                receiptDate: new Date('2024-01-15T10:00:00Z'),
                status: CheckingStatus.draft,
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [
                    {
                        id: lineId,
                        checkingId,
                        supplyItemId: 100,
                        receivedQty: 25,
                        unitOfMeasure: UnitOfMeasure.UN,
                        supplyItem: {
                            id: 100,
                            name: 'Item 1',
                            code: 'ITEM001',
                            description: 'Descrição do item 1',
                        },
                    },
                ],
            };

            const updateModel = {
                receivedQty: 25,
                unitOfMeasure: UnitOfMeasure.UN,
            };

            const expectedResponse = new CheckingResponseDto(
                checkingId,
                checking.receiptDate,
                CheckingStatus.draft,
                checking.createdAt,
                [],
            );

            // Mock do findById
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.toUpdateLinesModel.mockReturnValue(updateModel as any);

            // Mock do updateLine
            repository.updateLine.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper para response
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.updateLine(checkingId, lineId, updateDto);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toUpdateLinesModel).toHaveBeenCalledWith(updateDto);
            expect(repository.updateLine).toHaveBeenCalledWith(checkingId, lineId, updateModel);
        });
    });

    describe('findById', () => {
        it('deve retornar um checking quando encontrado', async () => {
            // Arrange
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

            // Mock do repository
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.findById(checkingId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar NotFound quando checking não é encontrado', async () => {
            // Arrange
            const checkingId = 999;

            // Mock do repository retornando null
            repository.findById.mockResolvedValue(Result.Ok(null));

            // Act
            const result = await service.findById(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(`Não foram encontrados recebimentos para o Id ${checkingId}`);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository falha', async () => {
            // Arrange
            const checkingId = 1;
            const repositoryError = 'Erro ao conectar com o banco de dados';

            // Mock do repository retornando erro
            repository.findById.mockResolvedValue(Result.Fail(repositoryError));

            // Act
            const result = await service.findById(checkingId);

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {
            // Arrange
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

            // Mock do repository
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper lançando exceção
            checkingMapper.fromEntity.mockImplementation(() => {
                throw mapperError;
            });

            // Act & Assert
            await expect(service.findById(checkingId)).rejects.toThrow(mapperError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking com status received', async () => {
            // Arrange
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

            // Mock do repository
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.findById(checkingId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking com status cancelled', async () => {
            // Arrange
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

            // Mock do repository
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.findById(checkingId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking com múltiplas linhas', async () => {
            // Arrange
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

            // Mock do repository
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.findById(checkingId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar checking sem linhas', async () => {
            // Arrange
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

            // Mock do repository
            repository.findById.mockResolvedValue(Result.Ok(checking as any));

            // Mock do mapper
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.findById(checkingId);

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });
    });

    describe('findAll', () => {
        it('deve retornar lista de checkings quando existem dados', async () => {
            // Arrange
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

            // Mock do repository
            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));

            // Mock do mapper
            checkingMapper.fromEntity
                .mockReturnValueOnce(expectedResponses[0])
                .mockReturnValueOnce(expectedResponses[1]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponses);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(2);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(1, checkings[0]);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(2, checkings[1]);
        });

        it('deve retornar NoContent quando não existem checkings', async () => {
            // Arrange
            const emptyCheckings: any[] = [];

            // Mock do repository retornando array vazio
            repository.findAll.mockResolvedValue(Result.Ok(emptyCheckings));

            // Act
            const result = await service.findAll();

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('No Content');
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar NoContent quando repository retorna null', async () => {
            // Arrange
            // Mock do repository retornando null
            repository.findAll.mockResolvedValue(Result.Ok(null as any));

            // Act
            const result = await service.findAll();

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe('No Content');
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository falha', async () => {
            // Arrange
            const repositoryError = 'Erro ao conectar com o banco de dados';

            // Mock do repository retornando erro
            repository.findAll.mockResolvedValue(Result.Fail(repositoryError));

            // Act
            const result = await service.findAll();

            // Assert
            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {
            // Arrange
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

            // Mock do repository
            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));

            // Mock do mapper lançando exceção
            checkingMapper.fromEntity.mockImplementation(() => {
                throw mapperError;
            });

            // Act & Assert
            await expect(service.findAll()).rejects.toThrow(mapperError);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checkings[0]);
        });

        it('deve retornar lista com checkings de diferentes status', async () => {
            // Arrange
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

            // Mock do repository
            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));

            // Mock do mapper
            checkingMapper.fromEntity
                .mockReturnValueOnce(expectedResponses[0])
                .mockReturnValueOnce(expectedResponses[1])
                .mockReturnValueOnce(expectedResponses[2]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponses);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(3);
        });

        it('deve retornar lista com checkings que têm linhas', async () => {
            // Arrange
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

            // Mock do repository
            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));

            // Mock do mapper
            checkingMapper.fromEntity
                .mockReturnValueOnce(expectedResponses[0])
                .mockReturnValueOnce(expectedResponses[1]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponses);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(2);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(1, checkings[0]);
            expect(checkingMapper.fromEntity).toHaveBeenNthCalledWith(2, checkings[1]);
        });

        it('deve retornar lista com um único checking', async () => {
            // Arrange
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

            // Mock do repository
            repository.findAll.mockResolvedValue(Result.Ok(checkings as any));

            // Mock do mapper
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual([expectedResponse]);
            expect(repository.findAll).toHaveBeenCalled();
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(1);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checkings[0]);
        });
    });
});
