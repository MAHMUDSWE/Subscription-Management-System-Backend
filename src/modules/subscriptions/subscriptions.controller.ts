import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { UserRole } from '../../entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Subscription created successfully.' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
    return this.subscriptionsService.create(createSubscriptionDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return all subscriptions.' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.subscriptionsService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return a subscription by ID.' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return subscriptions for a user.' })
  findByUser(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.subscriptionsService.findByUser(userId, paginationDto);
  }

  @Get('organization/:organizationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Return subscriptions for an organization.' })
  findByOrganization(
    @Param('organizationId') organizationId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.subscriptionsService.findByOrganization(organizationId, paginationDto);
  }

  @Patch(':id/auto-renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Toggle auto-renew for a subscription.' })
  toggleAutoRenew(@Param('id') id: string) {
    return this.subscriptionsService.toggleAutoRenew(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cancel a subscription.' })
  cancel(
    @Param('id') id: string,
    @Body() cancelDto: CancelSubscriptionDto
  ) {
    return this.subscriptionsService.cancel(id, cancelDto);
  }
}