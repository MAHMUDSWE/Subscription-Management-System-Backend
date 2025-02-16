import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from '../../entities/activity-log.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
    ) { }

    async logActivity(
        type: ActivityType,
        user: User,
        metadata: Record<string, any>,
        entityId?: string,
        entityType?: string,
        description?: string,
    ) {
        const activityLog = this.activityLogRepository.create({
            type,
            user,
            metadata,
            entityId,
            entityType,
            description,
        });

        return this.activityLogRepository.save(activityLog);
    }

    async getActivityLogs(userId?: string) {
        const query = this.activityLogRepository.createQueryBuilder('activity')
            .leftJoinAndSelect('activity.user', 'user')
            .orderBy('activity.createdAt', 'DESC');

        if (userId) {
            query.where('user.id = :userId', { userId });
        }

        return query.getMany();
    }
}