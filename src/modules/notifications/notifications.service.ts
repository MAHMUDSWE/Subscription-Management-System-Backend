import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { NotificationType } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { EventsGateway } from '../websockets/events.gateway';
import { NotificationRepository } from './repositories/notification.repository';

@Injectable()
export class NotificationsService {
    private readonly transporter;

    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly eventsGateway: EventsGateway,
        private readonly configService: ConfigService,
    ) {
        this.transporter = createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }

    async createNotification(
        user: User,
        type: NotificationType,
        title: string,
        message: string,
        sendEmail: boolean = false,
    ) {
        const notification = await this.notificationRepository.createNotification(
            user,
            type,
            title,
            message,
        );

        // Send real-time notification via WebSocket
        this.eventsGateway.server.to(user.id).emit('notification', notification);

        // Send email if required
        if (sendEmail) {
            await this.sendEmail(user.email, title, message);
        }

        return notification;
    }

    private async sendEmail(to: string, subject: string, text: string) {
        await this.transporter.sendMail({
            from: this.configService.get('SMTP_FROM'),
            to,
            subject,
            text,
        });
    }

    async getUserNotifications(userId: string) {
        return this.notificationRepository.findUserNotifications(userId);
    }

    async markAsRead(notificationId: string) {
        await this.notificationRepository.markAsRead(notificationId);
    }
}