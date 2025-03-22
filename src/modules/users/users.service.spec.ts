import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
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

    const mockCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STUDENT,
        phoneNumber: '1234567890',
    };

    const mockUserRepository = {
        findByEmail: jest.fn(),
        createUser: jest.fn(),
        findAllUsers: jest.fn(),
        findUserById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<UserRepository>(UserRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

            const result = await service.create(mockCreateUserDto);

            expect(repository.findByEmail).toHaveBeenCalledWith(mockCreateUserDto.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
            expect(repository.createUser).toHaveBeenCalledWith({
                ...mockCreateUserDto,
                password: 'hashedPassword',
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw ConflictException if email already exists', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(service.create(mockCreateUserDto)).rejects.toThrow(
                ConflictException,
            );
            expect(repository.findByEmail).toHaveBeenCalledWith(mockCreateUserDto.email);
            expect(repository.createUser).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            mockUserRepository.findAllUsers.mockResolvedValue([mockUser]);

            const result = await service.findAll();

            expect(repository.findAllUsers).toHaveBeenCalled();
            expect(result).toEqual([mockUser]);
        });
    });

    describe('findOne', () => {
        it('should return a user if found', async () => {
            mockUserRepository.findUserById.mockResolvedValue(mockUser);

            const result = await service.findOne('1');

            expect(repository.findUserById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockUserRepository.findUserById.mockResolvedValue(null);

            await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
            expect(repository.findUserById).toHaveBeenCalledWith('1');
        });
    });

    describe('findByEmail', () => {
        it('should return a user if found', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            const result = await service.findByEmail('test@example.com');

            expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            mockUserRepository.findByEmail.mockResolvedValue(null);

            const result = await service.findByEmail('test@example.com');

            expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(result).toBeNull();
        });
    });
});