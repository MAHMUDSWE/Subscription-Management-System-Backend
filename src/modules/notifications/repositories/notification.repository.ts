import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notification, NotificationType } from '../../../entities/notification.entity';
import { User } from '../../../entities/user.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
    constructor(private dataSource: DataSource) {
        super(Notification, dataSource.createEntityManager());
    }

    async createNotification(
        user: User,
        type: NotificationType,
        title: string,
        message: string,
    ): Promise<Notification> {
        const notification = this.create({
            user,
            type,
            title,
            message,
            read: false,
        });

        return this.save(notification);
    }

    async findUserNotifications(userId: string): Promise<Notification[]> {
        return this.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(notificationId: string): Promise<void> {
        await this.update(notificationId, { read: true });
    }
}