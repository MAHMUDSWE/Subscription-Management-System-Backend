import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
        phoneNumber: '1234567890',
        subscriptions: [],
        notifications: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
    };

    const mockCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
        phoneNumber: '1234567890',
    };

    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            mockUsersService.create.mockResolvedValue(mockUser);

            const result = await controller.create(mockCreateUserDto);

            expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
            expect(result).toEqual(mockUser);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            mockUsersService.findAll.mockResolvedValue([mockUser]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockUser]);
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            mockUsersService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne('1');

            expect(service.findOne).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });
    });
});