import { Injectable, NotFoundException } from '@nestjs/common';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { User } from '../../entities/user.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionRepository } from './repositories/subscription.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly organizationsService: OrganizationsService,
  ) { }

  async create(createSubscriptionDto: CreateSubscriptionDto, user: User): Promise<Subscription> {
    const organization = await this.organizationsService.findOne(createSubscriptionDto.organizationId);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    return this.subscriptionRepository.createSubscription({
      user,
      organization,
      amount: createSubscriptionDto.amount,
      status: SubscriptionStatus.PENDING,
      startDate,
      endDate,
      autoRenew: false,
    });
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.findAllSubscriptions();
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findSubscriptionById(id);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findSubscriptionsByUser(userId);
  }

  async findByOrganization(organizationId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findSubscriptionsByOrganization(organizationId);
  }

  async findExpiringSubscriptions(endDate: Date): Promise<Subscription[]> {
    return this.subscriptionRepository.findExpiringSubscriptions(endDate);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepository.update(id, { status });
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
}