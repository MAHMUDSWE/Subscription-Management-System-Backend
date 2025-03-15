import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '../../entities/notification.entity';
import { User, UserRole } from '../../entities/user.entity';
import { EventsGateway } from '../websockets/events.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from './repositories/notification.repository';

describe('NotificationsService', () => {
    let service: NotificationsService;
    let repository: NotificationRepository;
    let eventsGateway: EventsGateway;

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

    const mockNotificationRepository = {
        createNotification: jest.fn().mockResolvedValue(mockNotification),
        findUserNotifications: jest.fn().mockResolvedValue([mockNotification]),
        markAsRead: jest.fn().mockResolvedValue(undefined),
    };

    const mockEventsGateway = {
        server: {
            to: jest.fn().mockReturnValue({
                emit: jest.fn(),
            }),
        },
    };

    const mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
            const config = {
                SMTP_HOST: 'smtp.test.com',
                SMTP_PORT: 587,
                SMTP_USER: 'test@test.com',
                SMTP_PASS: 'password',
                SMTP_FROM: 'noreply@test.com',
            };
            return config[key];
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                {
                    provide: NotificationRepository,
                    useValue: mockNotificationRepository,
                },
                {
                    provide: EventsGateway,
                    useValue: mockEventsGateway,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        repository = module.get<NotificationRepository>(NotificationRepository);
        eventsGateway = module.get<EventsGateway>(EventsGateway);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createNotification', () => {
        it('should create a notification and emit websocket event', async () => {
            const result = await service.createNotification(
                mockUser,
                NotificationType.PAYMENT_SUCCESS,
                'Test Notification',
                'This is a test notification',
            );

            expect(repository.createNotification).toHaveBeenCalledWith(
                mockUser,
                NotificationType.PAYMENT_SUCCESS,
                'Test Notification',
                'This is a test notification',
            );
            expect(eventsGateway.server.to).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual(mockNotification);
        });
    });

    describe('getUserNotifications', () => {
        it('should return user notifications', async () => {
            const result = await service.getUserNotifications('1');

            expect(repository.findUserNotifications).toHaveBeenCalledWith('1');
            expect(result).toEqual([mockNotification]);
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            await service.markAsRead('1');

            expect(repository.markAsRead).toHaveBeenCalledWith('1');
        });
    });
});