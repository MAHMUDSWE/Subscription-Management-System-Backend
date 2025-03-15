import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityLog, ActivityType } from '../../../entities/activity-log.entity';
import { User } from '../../../entities/user.entity';

@Injectable()
export class ActivityRepository extends Repository<ActivityLog> {
    constructor(private dataSource: DataSource) {
        super(ActivityLog, dataSource.createEntityManager());
    }

    async createActivityLog(
        type: ActivityType,
        user: User,
        metadata: Record<string, any>,
        entityId?: string,
        entityType?: string,
        description?: string,
    ): Promise<ActivityLog> {
        const activityLog = this.create({
            type,
            user,
            metadata,
            entityId,
            entityType,
            description,
        });

        return this.save(activityLog);
    }

    async findAllActivityLogs(): Promise<ActivityLog[]> {
        return this.createQueryBuilder('activity')
            .leftJoinAndSelect('activity.user', 'user')
            .orderBy('activity.createdAt', 'DESC')
            .getMany();
    }

    async findUserActivityLogs(userId: string): Promise<ActivityLog[]> {
        return this.createQueryBuilder('activity')
            .leftJoinAndSelect('activity.user', 'user')
            .where('user.id = :userId', { userId })
            .orderBy('activity.createdAt', 'DESC')
            .getMany();
    }
}