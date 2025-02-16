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

    return this.subscriptionRepository.createSubscription({
      user,
      organization,
      amount: createSubscriptionDto.amount,
      status: SubscriptionStatus.PENDING,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
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
}