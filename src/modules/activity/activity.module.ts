import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from '../../entities/activity-log.entity';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './repositories/activity.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ActivityLog])],
    controllers: [ActivityController],
    providers: [ActivityService, ActivityRepository],
    exports: [ActivityService],
})
export class ActivityModule { }