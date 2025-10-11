import { Test, TestingModule } from '@nestjs/testing';
import { CheckingService } from '../../../../src/application/checking/services/checking.service';
import { ICheckingRepository } from '../../../../src/application/checking/persistence/ichecking.repository';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { CheckingResponseDto } from '../../../../src/application/checking/dto/checking-response.dto';
import { Result } from '../../../../src/domain/shared/result/result.pattern';
import { CheckingStatus, TransferType, UnitOfMeasure } from '@prisma/client';

jest.mock('@application/checking/mappers/checking.mapper');

describe('CheckingService delete (TDD)', () => {
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

    describe('deleteLine', () => {
        it('deve deletar uma linha com sucesso quando checkingId e lineId são válidos', async () => {

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

            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            repository.deleteLine.mockResolvedValue(Result.Ok(checking as any));


            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).toHaveBeenCalledWith(checkingId, lineId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve retornar erro quando checkingId é inválido (0)', async () => {

            const checkingId = 0;
            const lineId = 1;


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err0 = result.getError() as any;
            expect(err0 instanceof Error ? err0.message : err0).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checkingId é inválido (null)', async () => {

            const checkingId = null as any;
            const lineId = 1;


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err1 = result.getError() as any;
            expect(err1 instanceof Error ? err1.message : err1).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checkingId é inválido (undefined)', async () => {

            const checkingId = undefined as any;
            const lineId = 1;


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err2 = result.getError() as any;
            expect(err2 instanceof Error ? err2.message : err2).toBe('Numero de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (0)', async () => {

            const checkingId = 1;
            const lineId = 0;


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err3 = result.getError() as any;
            expect(err3 instanceof Error ? err3.message : err3).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (null)', async () => {

            const checkingId = 1;
            const lineId = null as any;


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err4 = result.getError() as any;
            expect(err4 instanceof Error ? err4.message : err4).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando lineId é inválido (undefined)', async () => {

            const checkingId = 1;
            const lineId = undefined as any;


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err5 = result.getError() as any;
            expect(err5 instanceof Error ? err5.message : err5).toBe('Numero de linha de recebimento invalido.');
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando checking não é encontrado', async () => {

            const checkingId = 999;
            const lineId = 1;
            const notFoundError = `Não foram encontrados recebimentos para o Id ${checkingId}`;

            repository.findById.mockResolvedValue(Result.NotFound(notFoundError));


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err6 = result.getError() as any;
            expect(err6 instanceof Error ? err6.message : err6).toBe(notFoundError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve retornar erro quando repository deleteLine falha', async () => {

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


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            repository.deleteLine.mockResolvedValue(Result.Fail(deleteError));


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err7 = result.getError() as any;
            expect(err7 instanceof Error ? err7.message : err7).toBe(deleteError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).toHaveBeenCalledWith(checkingId, lineId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledTimes(1);
        });

        it('deve retornar erro quando findById falha com erro interno', async () => {
            // Arrange
            const checkingId = 1;
            const lineId = 2;
            const internalError = 'Erro interno do banco de dados';

            repository.findById.mockResolvedValue(Result.Fail(internalError));


            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err8 = result.getError() as any;
            expect(err8 instanceof Error ? err8.message : err8).toBe(internalError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {

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


            repository.findById.mockResolvedValue(Result.Ok(checking as any));


            repository.deleteLine.mockResolvedValue(Result.Ok(checking as any));


            (checkingMapper.fromEntity as any)
                .mockReturnValueOnce(checking as any)
                .mockImplementationOnce(() => { throw mapperError; });


            await expect(service.deleteLine(checkingId, lineId)).rejects.toThrow(mapperError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).toHaveBeenCalledWith(checkingId, lineId);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(checking);
        });

        it('deve tratar ids negativos buscando e retornando NotFound do repository', async () => {

            const checkingId = -1;
            const lineId = -2;
            const notFoundError = `Não foram encontrados recebimentos para o Id ${checkingId}`;

            repository.findById.mockResolvedValue(Result.NotFound(notFoundError));

            const result = await service.deleteLine(checkingId, lineId);


            expect(result.isFailure).toBe(true);
            const err9 = result.getError() as any;
            expect(err9 instanceof Error ? err9.message : err9).toBe(notFoundError);
            expect(repository.findById).toHaveBeenCalledWith(checkingId);
            expect(repository.deleteLine).not.toHaveBeenCalled();
        });
    });




});
