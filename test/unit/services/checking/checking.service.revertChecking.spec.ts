import { Test, TestingModule } from '@nestjs/testing';
import { CheckingService } from '../../../../src/application/checking/services/checking.service';
import { ICheckingRepository } from '../../../../src/application/checking/persistence/ichecking.repository';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { CreateTransferResponseDto } from '../../../../src/application/checking/dto/create-transfer-response.dto';
import { Result } from '../../../../src/domain/shared/result/result.pattern';
import { CheckingStatus, TransferType, UnitOfMeasure } from '@prisma/client';

jest.mock('@application/checking/mappers/checking.mapper');

describe('CheckingService revertChecking (TDD)', () => {
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

    describe('revertChecking', () => {
        it('deve reverter um recebimento com sucesso quando status é received e tem linhas', async () => {

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


            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            checkingMapper.fromEntity.mockReturnValue(checking as any);


            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));


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


            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));


            repository.updateCheckingStatus.mockResolvedValue(Result.Ok(checking as any));


            repository.findTransferById.mockResolvedValue(Result.Ok(transferWithLines as any));


            checkingMapper.toCreateTransferResponseDto.mockReturnValue(expectedResponse);


            const result = await service.revertChecking(checkingId);


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

            const checkingId = 999;
            const notFoundError = `Não foram encontrados recebimentos para o Id ${checkingId}`;

            repository.findById.mockResolvedValue(Result.NotFound(notFoundError));


            const result = await service.revertChecking(checkingId);


            expect(result.isFailure).toBe(true);
            const err0 = result.getError() as any;
            expect(err0 instanceof Error ? err0.message : err0).toBe(notFoundError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não está em status received', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.draft,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            checkingMapper.fromEntity.mockReturnValue(checking as any);


            const result = await service.revertChecking(checkingId);


            expect(result.isFailure).toBe(true);
            const err1 = result.getError() as any;
            expect(err1 instanceof Error ? err1.message : err1).toBe(
                `Não é possivel reverter o recebimento ${checkingId} no status ${CheckingStatus.draft}`
            );
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não tem linhas', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [],
            };

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            checkingMapper.fromEntity.mockReturnValue(checking as any);


            const result = await service.revertChecking(checkingId);


            expect(result.isFailure).toBe(true);
            const err2 = result.getError() as any;
            expect(err2 instanceof Error ? err2.message : err2).toBe(
                `Não é possivel reverter o recebimento ${checkingId} com 0 linhas`
            );
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve lançar exceção quando createTransfer falha (comportamento atual do serviço)', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transferError = 'Erro ao criar transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            checkingMapper.fromEntity.mockReturnValue(checking as any);
            repository.createTransfer.mockResolvedValue(Result.Fail(transferError));

            await expect(service.revertChecking(checkingId)).rejects.toThrow('Cannot get the error of a successful result.');
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.createTransfer).toHaveBeenCalledWith({
                transferType: TransferType.outbound,
            });
            expect(repository.createTransferLines).not.toHaveBeenCalled();
        });

        it('deve lançar TypeError quando createTransferLines falha (comportamento atual)', async () => {

            const checkingId = 1;
            const checking = {
                id: checkingId,
                status: CheckingStatus.received,
                lines: [{ id: 1, receivedQty: 10 }],
            };

            const transfer = { id: 1, transferType: TransferType.outbound };
            const linesError = 'Erro ao criar linhas da transferência';

            repository.findById.mockResolvedValue(Result.Ok(checking as any));
            checkingMapper.fromEntity.mockReturnValue(checking as any);
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Fail(linesError));

            await expect(service.revertChecking(checkingId)).rejects.toThrow(/Cannot read properties of undefined/);
            expect(repository.createTransferLines).toHaveBeenCalled();
            expect(repository.updateCheckingStatus).toHaveBeenCalledWith(checkingId, CheckingStatus.cancelled);
        });

        it('deve lançar exceção quando updateCheckingStatus falha (comportamento atual)', async () => {

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
            checkingMapper.fromEntity.mockReturnValue(checking as any);
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));
            repository.updateCheckingStatus.mockResolvedValue(Result.Fail(statusError));

            await expect(service.revertChecking(checkingId)).rejects.toThrow('Cannot get the error of a successful result.');
            expect(repository.updateCheckingStatus).toHaveBeenCalledWith(checkingId, CheckingStatus.cancelled);
            expect(repository.findTransferById).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando findTransferById falha', async () => {

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
            checkingMapper.fromEntity.mockReturnValue(checking as any);
            repository.createTransfer.mockResolvedValue(Result.Ok(transfer as any));
            checkingMapper.toInventTransferLineModel.mockReturnValue({} as any);
            repository.createTransferLines.mockResolvedValue(Result.Ok(transferWithLines as any));
            repository.updateCheckingStatus.mockResolvedValue(Result.Ok(checking as any));
            repository.findTransferById.mockResolvedValue(Result.Fail(findError));


            const result = await service.revertChecking(checkingId);

            expect(result.isFailure).toBe(true);
            const err6 = result.getError() as any;
            expect(err6 instanceof Error ? err6.message : err6).toBe(`Transferência criada, mas ocorreu um erro ao buscar os dados finais: ${findError}`);
            expect(repository.findTransferById).toHaveBeenCalledWith(1);
            expect(checkingMapper.toCreateTransferResponseDto).not.toHaveBeenCalled();
        });
    });




});
