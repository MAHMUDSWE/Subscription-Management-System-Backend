import { Injectable } from '@nestjs/common';
import { DataSource, LessThanOrEqual, Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../../entities/subscription.entity';

@Injectable()
export class SubscriptionRepository extends Repository<Subscription> {
    constructor(private dataSource: DataSource) {
        super(Subscription, dataSource.createEntityManager());
    }

    async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
        const subscription = this.create(subscriptionData);
        return this.save(subscription);
    }

    async findPaginatedSubscriptions(skip: number, take: number): Promise<[Subscription[], number]> {
        return this.findAndCount({
            skip,
            take,
            relations: ['user', 'organization', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }

    async findSubscriptionById(id: string): Promise<Subscription | null> {
        return this.findOne({
            where: { id },
            relations: ['user', 'organization', 'payments'],
        });
    }

    async findSubscriptionsByUser(userId: string, skip: number, take: number): Promise<[Subscription[], number]> {
        return this.findAndCount({
            where: { user: { id: userId } },
            skip,
            take,
            relations: ['organization', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }

    async findSubscriptionsByOrganization(organizationId: string, skip: number, take: number): Promise<[Subscription[], number]> {
        return this.findAndCount({
            where: { organization: { id: organizationId } },
            skip,
            take,
            relations: ['user', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }

    async findExpiringSubscriptions(endDate: Date): Promise<Subscription[]> {
        return this.find({
            where: {
                status: SubscriptionStatus.ACTIVE,
                endDate: LessThanOrEqual(endDate),
            },
            relations: ['user', 'organization'],
        });
    }
}