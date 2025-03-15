import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { NotificationType } from '../../../entities/notification.entity';
import { User, UserRole } from '../../../entities/user.entity';
import { NotificationRepository } from './notification.repository';

describe('NotificationRepository', () => {
    let repository: NotificationRepository;

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

    const mockNotification = {
        id: '1',
        type: NotificationType.PAYMENT_SUCCESS,
        user: mockUser,
        title: 'Test Notification',
        message: 'This is a test notification',
        read: false,
        createdAt: new Date(),
    };

    const mockDataSource = {
        createEntityManager: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationRepository,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        repository = module.get<NotificationRepository>(NotificationRepository);
        jest.spyOn(repository, 'create').mockReturnValue(mockNotification);
        jest.spyOn(repository, 'save').mockResolvedValue(mockNotification);
        jest.spyOn(repository, 'find').mockResolvedValue([mockNotification]);
        jest.spyOn(repository, 'update').mockResolvedValue(undefined);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('createNotification', () => {
        it('should create and save a notification', async () => {
            const result = await repository.createNotification(
                mockUser,
                NotificationType.PAYMENT_SUCCESS,
                'Test Notification',
                'This is a test notification',
            );

            expect(repository.create).toHaveBeenCalledWith({
                user: mockUser,
                type: NotificationType.PAYMENT_SUCCESS,
                title: 'Test Notification',
                message: 'This is a test notification',
                read: false,
            });
            expect(repository.save).toHaveBeenCalledWith(mockNotification);
            expect(result).toEqual(mockNotification);
        });
    });

    describe('findUserNotifications', () => {
        it('should return notifications for a specific user', async () => {
            const result = await repository.findUserNotifications('1');

            expect(repository.find).toHaveBeenCalledWith({
                where: { user: { id: '1' } },
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual([mockNotification]);
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            await repository.markAsRead('1');

            expect(repository.update).toHaveBeenCalledWith('1', { read: true });
        });
    });
});