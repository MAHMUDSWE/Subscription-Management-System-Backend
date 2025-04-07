import { Injectable, NotFoundException } from '@nestjs/common';
import { getPaginatedResponse, getPaginationParams } from 'src/common/utils/pagination.util';
import { PaginatedResponse, PaginationDto } from '../../common/dtos/pagination.dto';
import { NotificationType } from '../../entities/notification.entity';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionRepository } from './repositories/subscription.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly organizationsService: OrganizationsService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async create(createSubscriptionDto: CreateSubscriptionDto, user: User): Promise<Subscription> {
    const organization = await this.organizationsService.findOne(createSubscriptionDto.organizationId);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await this.subscriptionRepository.createSubscription({
      user,
      organization,
      amount: createSubscriptionDto.amount,
      status: SubscriptionStatus.PENDING,
      startDate,
      endDate,
      autoRenew: false,
    });

    this.notificationsService.createNotification(
      user,
      NotificationType.SUBSCRIPTION_ACTIVATED,
      'Subscription Created',
      `Your subscription to ${organization.name} has been created and is pending payment.`,
      true
    );

    return subscription;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Subscription>> {
    const { skip, take } = getPaginationParams(paginationDto.page, paginationDto.limit);

    const [items, total] = await this.subscriptionRepository.findPaginatedSubscriptions(skip, take);

    return getPaginatedResponse(items, total, paginationDto.page, paginationDto.limit);
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findSubscriptionById(id);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByUser(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Subscription>> {
    const { skip, take } = getPaginationParams(paginationDto.page, paginationDto.limit);
    const [items, total] = await this.subscriptionRepository.findSubscriptionsByUser(userId, skip, take);
    return getPaginatedResponse(items, total, paginationDto.page, paginationDto.limit);
  }

  async findByOrganization(organizationId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Subscription>> {
    const { skip, take } = getPaginationParams(paginationDto.page, paginationDto.limit);
    const [items, total] = await this.subscriptionRepository.findSubscriptionsByOrganization(organizationId, skip, take);
    return getPaginatedResponse(items, total, paginationDto.page, paginationDto.limit);
  }

  async findExpiringSubscriptions(endDate: Date): Promise<Subscription[]> {
    return this.subscriptionRepository.findExpiringSubscriptions(endDate);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepository.update(id, { status });

    if (status === SubscriptionStatus.ACTIVE) {
      await this.notificationsService.createNotification(
        subscription.user,
        NotificationType.SUBSCRIPTION_ACTIVATED,
        'Subscription Activated',
        `Your subscription to ${subscription.organization.name} is now active.`,
        true
      );
    }
  }

  async toggleAutoRenew(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.autoRenew = !subscription.autoRenew;
    return this.subscriptionRepository.save(subscription);
  }

  async extend(id: string, months: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    subscription.endDate = newEndDate;
    return this.subscriptionRepository.save(subscription);
  }

  async cancel(id: string, cancelDto: CancelSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (cancelDto.immediate) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.endDate = new Date();
    } else {
      subscription.autoRenew = false;
    }

    if (cancelDto.reason) {
      subscription['cancellationReason'] = cancelDto.reason;
    }

    const updatedSubscription = await this.subscriptionRepository.save(subscription);

    await this.notificationsService.createNotification(
      subscription.user,
      NotificationType.SUBSCRIPTION_CANCELLED,
      'Subscription Cancelled',
      `Your subscription to ${subscription.organization.name} has been cancelled.`,
      true
    );

    return updatedSubscription;
  }
}