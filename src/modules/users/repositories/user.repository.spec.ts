import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../../../entities/user.entity';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
    let repository: UserRepository;

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

    const mockDataSource = {
        createEntityManager: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
        jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(repository, 'create').mockReturnValue(mockUser);
        jest.spyOn(repository, 'save').mockResolvedValue(mockUser);
        jest.spyOn(repository, 'find').mockResolvedValue([mockUser]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            const result = await repository.findByEmail('test@example.com');

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('createUser', () => {
        it('should create and save a new user', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'hashedPassword',
                firstName: 'Test',
                lastName: 'User',
            };

            const result = await repository.createUser(userData);

            expect(repository.create).toHaveBeenCalledWith(userData);
            expect(repository.save).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockUser);
        });
    });

    describe('findAllUsers', () => {
        it('should return all users', async () => {
            const result = await repository.findAllUsers();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual([mockUser]);
        });
    });

    describe('findUserById', () => {
        it('should find a user by id', async () => {
            const result = await repository.findUserById('1');

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: '1' },
                relations: ['subscriptions'],
            });
            expect(result).toEqual(mockUser);
        });
    });
});