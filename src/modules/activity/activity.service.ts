import { Injectable } from '@nestjs/common';
import { ActivityType } from '../../entities/activity-log.entity';
import { User } from '../../entities/user.entity';
import { ActivityRepository } from './repositories/activity.repository';

@Injectable()
export class ActivityService {
    constructor(private readonly activityRepository: ActivityRepository) { }

    async logActivity(
        type: ActivityType,
        user: User,
        metadata: Record<string, any>,
        entityId?: string,
        entityType?: string,
        description?: string,
    ) {
        return this.activityRepository.createActivityLog(
            type,
            user,
            metadata,
            entityId,
            entityType,
            description,
        );
    }

    async getActivityLogs(userId?: string) {
        if (userId) {
            return this.activityRepository.findUserActivityLogs(userId);
        }
        return this.activityRepository.findAllActivityLogs();
    }
}