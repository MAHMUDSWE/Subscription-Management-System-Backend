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

    async findAllSubscriptions(): Promise<Subscription[]> {
        return this.find({
            relations: ['user', 'organization', 'payments'],
        });
    }

    async findSubscriptionById(id: string): Promise<Subscription | null> {
        return this.findOne({
            where: { id },
            relations: ['user', 'organization', 'payments'],
        });
    }

    async findSubscriptionsByUser(userId: string): Promise<Subscription[]> {
        return this.find({
            where: { user: { id: userId } },
            relations: ['organization', 'payments'],
        });
    }

    async findSubscriptionsByOrganization(organizationId: string): Promise<Subscription[]> {
        return this.find({
            where: { organization: { id: organizationId } },
            relations: ['user', 'payments'],
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