import { Injectable } from '@nestjs/common';
import { NotificationType } from '../../../entities/notification.entity';

@Injectable()
export class EmailTemplatesService {
    getTemplate(type: NotificationType, data: any): { subject: string; html: string } {
        switch (type) {
            case NotificationType.PAYMENT_SUCCESS:
                return this.getPaymentSuccessTemplate(data);
            case NotificationType.PAYMENT_FAILED:
                return this.getPaymentFailedTemplate(data);
            case NotificationType.SUBSCRIPTION_EXPIRING:
                return this.getSubscriptionExpiringTemplate(data);
            case NotificationType.SUBSCRIPTION_ACTIVATED:
                return this.getSubscriptionActivatedTemplate(data);
            case NotificationType.SUBSCRIPTION_CANCELLED:
                return this.getSubscriptionCancelledTemplate(data);
            default:
                return this.getDefaultTemplate(data);
        }
    }

    private getPaymentSuccessTemplate(data: any) {
        return {
            subject: 'Payment Successful',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2ecc71;">Payment Successful</h2>
          <p>Dear ${data.userName},</p>
          <p>Your payment of ${data.amount} has been successfully processed.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Payment Details:</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>Amount: ${data.amount}</li>
              <li>Date: ${data.date}</li>
              <li>Transaction ID: ${data.transactionId}</li>
            </ul>
          </div>
          <p>Thank you for your continued subscription.</p>
        </div>
      `,
        };
    }

    private getPaymentFailedTemplate(data: any) {
        return {
            subject: 'Payment Failed',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Payment Failed</h2>
          <p>Dear ${data.userName},</p>
          <p>We were unable to process your payment of ${data.amount}.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>What to do next:</strong></p>
            <ul>
              <li>Check your payment method details</li>
              <li>Ensure sufficient funds are available</li>
              <li>Try again or use a different payment method</li>
            </ul>
          </div>
          <p>If you need assistance, please contact our support team.</p>
        </div>
      `,
        };
    }

    private getSubscriptionExpiringTemplate(data: any) {
        return {
            subject: 'Subscription Expiring Soon',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f39c12;">Subscription Expiring Soon</h2>
          <p>Dear ${data.userName},</p>
          <p>Your subscription to ${data.organizationName} will expire on ${data.expiryDate}.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Subscription Details:</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>Organization: ${data.organizationName}</li>
              <li>Expiry Date: ${data.expiryDate}</li>
              <li>Monthly Fee: ${data.monthlyFee}</li>
            </ul>
          </div>
          <p>To continue enjoying our services, please renew your subscription.</p>
        </div>
      `,
        };
    }

    private getSubscriptionActivatedTemplate(data: any) {
        return {
            subject: 'Subscription Activated',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2ecc71;">Subscription Activated</h2>
          <p>Dear ${data.userName},</p>
          <p>Your subscription to ${data.organizationName} has been successfully activated.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Subscription Details:</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>Organization: ${data.organizationName}</li>
              <li>Start Date: ${data.startDate}</li>
              <li>End Date: ${data.endDate}</li>
              <li>Monthly Fee: ${data.monthlyFee}</li>
            </ul>
          </div>
          <p>Thank you for choosing our service!</p>
        </div>
      `,
        };
    }

    private getSubscriptionCancelledTemplate(data: any) {
        return {
            subject: 'Subscription Cancelled',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Subscription Cancelled</h2>
          <p>Dear ${data.userName},</p>
          <p>Your subscription to ${data.organizationName} has been cancelled.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Subscription Details:</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>Organization: ${data.organizationName}</li>
              <li>Cancellation Date: ${data.cancellationDate}</li>
            </ul>
          </div>
          <p>We're sorry to see you go. If you change your mind, you can always resubscribe.</p>
        </div>
      `,
        };
    }

    private getDefaultTemplate(data: any) {
        return {
            subject: 'Notification',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Notification</h2>
          <p>Dear ${data.userName},</p>
          <p>${data.message}</p>
        </div>
      `,
        };
    }
}