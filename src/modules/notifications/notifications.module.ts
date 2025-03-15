import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity';
import { WebsocketsModule } from '../websockets/websockets.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from './repositories/notification.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        WebsocketsModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationRepository],
    exports: [NotificationsService],
})
export class NotificationsModule { }