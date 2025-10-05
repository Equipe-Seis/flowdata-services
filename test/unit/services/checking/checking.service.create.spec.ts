import { Test, TestingModule } from '@nestjs/testing';
import { CheckingService } from '../../../../src/application/checking/services/checking.service';
import { ICheckingRepository } from '../../../../src/application/checking/persistence/ichecking.repository';
import { CheckingMapper } from '@application/checking/mappers/checking.mapper';
import { CreateCheckingDto } from '../../../../src/application/checking/dto/create-checking.dto';
import { CheckingResponseDto } from '../../../../src/application/checking/dto/checking-response.dto';
import { Result } from '../../../../src/domain/shared/result/result.pattern';
import { CheckingStatus, TransferType, UnitOfMeasure } from '@prisma/client';

jest.mock('@application/checking/mappers/checking.mapper');

describe('CheckingService create (TDD)', () => {
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


            checkingMapper.toModel.mockReturnValue(checkingModel as any);
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            repository.create.mockResolvedValue(Result.Ok(createdEntity as any));


            const result = await service.create(createDto);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).toHaveBeenCalledWith(checkingModel);
            expect(checkingMapper.fromEntity).toHaveBeenCalledWith(createdEntity);
        });

        it('deve criar um checking sem data de recebimento (usa data atual)', async () => {

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


            checkingMapper.toModel.mockReturnValue(checkingModel as any);
            checkingMapper.fromEntity.mockReturnValue(expectedResponse);


            repository.create.mockResolvedValue(Result.Ok(createdEntity as any));


            const result = await service.create(createDto);


            expect(result.isSuccess).toBe(true);
            expect(result.getValue()).toEqual(expectedResponse);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).toHaveBeenCalledWith(checkingModel);
        });

        it('deve retornar erro quando o repository falha', async () => {

            const createDto: CreateCheckingDto = {
                receiptDate: new Date('2024-01-15T10:00:00Z'),
            };

            const checkingModel = {
                receiptDate: createDto.receiptDate,
            };

            const repositoryError = 'Erro ao conectar com o banco de dados';


            checkingMapper.toModel.mockReturnValue(checkingModel as any);


            repository.create.mockResolvedValue(Result.Fail(repositoryError));


            const result = await service.create(createDto);


            expect(result.isFailure).toBe(true);
            expect(result.getError()).toBe(repositoryError);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).toHaveBeenCalledWith(checkingModel);
            expect(checkingMapper.fromEntity).not.toHaveBeenCalled();
        });

        it('deve propagar exceção quando mapper falha', async () => {

            const createDto: CreateCheckingDto = {
                receiptDate: new Date('2024-01-15T10:00:00Z'),
            };

            const mapperError = new Error('Erro no mapper');


            checkingMapper.toModel.mockImplementation(() => {
                throw mapperError;
            });


            await expect(service.create(createDto)).rejects.toThrow(mapperError);
            expect(checkingMapper.toModel).toHaveBeenCalledWith(createDto);
            expect(repository.create).not.toHaveBeenCalled();
        });
    });




});
