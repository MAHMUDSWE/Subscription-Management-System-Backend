import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from '../../entities/activity-log.entity';
import { User, UserRole } from '../../entities/user.entity';
import { ActivityService } from './activity.service';

describe('ActivityService', () => {
    let service: ActivityService;
    let repository: Repository<ActivityLog>;

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

    const mockActivityLog: ActivityLog = {
        id: '1',
        type: ActivityType.USER_CREATED,
        user: mockUser,
        metadata: {},
        entityId: '1',
        entityType: 'user',
        description: 'User created',
        createdAt: new Date(),
    };

    const mockRepository = {
        create: jest.fn().mockReturnValue(mockActivityLog),
        save: jest.fn().mockResolvedValue(mockActivityLog),
        createQueryBuilder: jest.fn(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([mockActivityLog]),
        })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivityService,
                {
                    provide: getRepositoryToken(ActivityLog),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<ActivityService>(ActivityService);
        repository = module.get<Repository<ActivityLog>>(getRepositoryToken(ActivityLog));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('logActivity', () => {
        it('should create and save an activity log', async () => {
            const result = await service.logActivity(
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

    describe('getActivityLogs', () => {
        it('should return all activity logs when no userId is provided', async () => {
            const result = await service.getActivityLogs();

            expect(repository.createQueryBuilder).toHaveBeenCalledWith('activity');
            expect(result).toEqual([mockActivityLog]);
        });

        it('should return filtered activity logs when userId is provided', async () => {
            const result = await service.getActivityLogs('1');

            expect(repository.createQueryBuilder).toHaveBeenCalledWith('activity');
            expect(result).toEqual([mockActivityLog]);
        });
    });
});