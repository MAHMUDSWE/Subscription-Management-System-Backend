import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ActivityType } from '../../../entities/activity-log.entity';
import { User, UserRole } from '../../../entities/user.entity';
import { ActivityRepository } from './activity.repository';

describe('ActivityRepository', () => {
    let repository: ActivityRepository;

    const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
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

    const mockActivityLog = {
        id: '1',
        type: ActivityType.USER_CREATED,
        user: mockUser,
        metadata: {},
        entityId: '1',
        entityType: 'user',
        description: 'User created',
        createdAt: new Date(),
    };

    const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockActivityLog]),
    };

    const mockDataSource = {
        createEntityManager: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivityRepository,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        repository = module.get<ActivityRepository>(ActivityRepository);
        jest.spyOn(repository, 'create').mockReturnValue(mockActivityLog);
        jest.spyOn(repository, 'save').mockResolvedValue(mockActivityLog);
        jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('createActivityLog', () => {
        it('should create and save an activity log', async () => {
            const result = await repository.createActivityLog(
                ActivityType.USER_CREATED,
                mockUser,
                {},
                '1',
                'user',
                'User created'
            );

            expect(repository.create).toHaveBeenCalledWith({
                type: ActivityType.USER_CREATED,
                user: mockUser,
                metadata: {},
                entityId: '1',
                entityType: 'user',
                description: 'User created',
            });
            expect(repository.save).toHaveBeenCalledWith(mockActivityLog);
            expect(result).toEqual(mockActivityLog);
        });
    });

    describe('findAllActivityLogs', () => {
        it('should return all activity logs', async () => {
            const result = await repository.findAllActivityLogs();

            expect(repository.createQueryBuilder).toHaveBeenCalledWith('activity');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('activity.user', 'user');
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('activity.createdAt', 'DESC');
            expect(result).toEqual([mockActivityLog]);
        });
    });

    describe('findUserActivityLogs', () => {
        it('should return activity logs for a specific user', async () => {
            const result = await repository.findUserActivityLogs('1');

            expect(repository.createQueryBuilder).toHaveBeenCalledWith('activity');
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('activity.user', 'user');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.id = :userId', { userId: '1' });
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('activity.createdAt', 'DESC');
            expect(result).toEqual([mockActivityLog]);
        });
    });
});