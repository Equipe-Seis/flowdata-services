import { Test, TestingModule } from '@nestjs/testing';
import { CheckingService } from '../../../../src/application/checking/services/checking.service';
import { ICheckingRepository } from '../../../../src/application/checking/persistence/ichecking.repository';
import { CheckingMapper } from '../../../../src/application/checking/mappers/checking.mapper';
import { CheckingStatus, TransferType, UnitOfMeasure } from '@prisma/client';


jest.mock('../../../../src/application/checking/mappers/checking.mapper');

describe('CheckingService concludeChecking (TDD)', () => {
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

    describe('concludeChecking', () => {
        it('deve concluir um recebimento com sucesso quando status é received e tem linhas', async () => {

            const checkingId = 1;
            const checking = { id: checkingId, status: CheckingStatus.received, lines: [] };
        });

        it('deve retornar um erro quando status não é received', async () => {

            const checkingId = 1;
            const checking = { id: checkingId, status: CheckingStatus.draft, lines: [] };
        });

        it('deve retornar um erro quando não tem linhas', async () => {

            const checkingId = 1;
            const checking = { id: checkingId, status: CheckingStatus.received, lines: [] };
        });

        it('deve retornar um erro quando não tem linhas', async () => {

            const checkingId = 1;
            const checking = { id: checkingId, status: CheckingStatus.received, lines: [] };
        });

    });


});
