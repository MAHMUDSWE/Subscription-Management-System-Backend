import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationType } from '../../../entities/notification.entity';
import { PaymentMethod } from '../../../entities/payment.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { PaymentsService } from '../../payments/payments.service';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class SubscriptionRenewalService {
    private readonly logger = new Logger(SubscriptionRenewalService.name);
    private readonly EXPIRY_WARNING_DAYS = 7;

    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly paymentsService: PaymentsService,
        private readonly notificationsService: NotificationsService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleExpiringSubscriptions() {
        try {
            const oneWeekFromNow = new Date();
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + this.EXPIRY_WARNING_DAYS);

            const subscriptions = await this.subscriptionsService.findExpiringSubscriptions(oneWeekFromNow);

            for (const subscription of subscriptions) {
                await this.notificationsService.createNotification(
                    subscription.user,
                    NotificationType.SUBSCRIPTION_EXPIRING,
                    'Subscription Expiring Soon',
                    `Your subscription for ${subscription.organization.name} will expire in ${this.EXPIRY_WARNING_DAYS} days.`,
                    true
                );

                if (subscription.autoRenew) {
                    await this.paymentsService.processPayment({
                        subscriptionId: subscription.id,
                        amount: subscription.amount,
                        method: PaymentMethod.STRIPE,
                        currency: 'USD',
                        metadata: {
                            type: 'renewal',
                            organizationId: subscription.organization.id,
                        },
                    });
                }
            }
        } catch (error) {
            this.logger.error('Error processing subscription renewals:', error);
        }
    }
}