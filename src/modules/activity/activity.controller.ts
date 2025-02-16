import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller('activity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    @UseGuards(RoleGuard)
    @Roles(UserRole.ADMIN)
    getAllActivity() {
        return this.activityService.getActivityLogs();
    }

    @Get('user/:userId')
    getUserActivity(@Param('userId') userId: string) {
        return this.activityService.getActivityLogs(userId);
    }
}