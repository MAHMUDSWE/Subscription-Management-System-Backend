import { Test, TestingModule } from '@nestjs/testing';
import { ActivityType } from '../../entities/activity-log.entity';
import { User, UserRole } from '../../entities/user.entity';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './repositories/activity.repository';

describe('ActivityService', () => {
    let service: ActivityService;
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

    const mockActivityRepository = {
        createActivityLog: jest.fn().mockResolvedValue(mockActivityLog),
        findAllActivityLogs: jest.fn().mockResolvedValue([mockActivityLog]),
        findUserActivityLogs: jest.fn().mockResolvedValue([mockActivityLog]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivityService,
                {
                    provide: ActivityRepository,
                    useValue: mockActivityRepository,
                },
            ],
        }).compile();

        service = module.get<ActivityService>(ActivityService);
        repository = module.get<ActivityRepository>(ActivityRepository);
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

            expect(repository.createActivityLog).toHaveBeenCalledWith(
                ActivityType.USER_CREATED,
                mockUser,
                {},
                '1',
                'user',
                'User created'
            );
            expect(result).toEqual(mockActivityLog);
        });
    });

    describe('getActivityLogs', () => {
        it('should return all activity logs when no userId is provided', async () => {
            const result = await service.getActivityLogs();

            expect(repository.findAllActivityLogs).toHaveBeenCalled();
            expect(result).toEqual([mockActivityLog]);
        });

        it('should return filtered activity logs when userId is provided', async () => {
            const result = await service.getActivityLogs('1');

            expect(repository.findUserActivityLogs).toHaveBeenCalledWith('1');
            expect(result).toEqual([mockActivityLog]);
        });
    });
});