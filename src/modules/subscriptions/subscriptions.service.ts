import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { User } from '../../entities/user.entity';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, user: User): Promise<Subscription> {
    const organization = await this.organizationsService.findOne(createSubscriptionDto.organizationId);
    
    const subscription = this.subscriptionRepository.create({
      user,
      organization,
      amount: createSubscriptionDto.amount,
      status: SubscriptionStatus.PENDING,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    });

    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['user', 'organization', 'payments'],
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user', 'organization', 'payments'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { user: { id: userId } },
      relations: ['organization', 'payments'],
    });
  }

  async findByOrganization(organizationId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['user', 'payments'],
    });
  }
}