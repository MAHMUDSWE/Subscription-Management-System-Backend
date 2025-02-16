import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityType {
    USER_CREATED = 'user_created',
    USER_UPDATED = 'user_updated',
    SUBSCRIPTION_CREATED = 'subscription_created',
    SUBSCRIPTION_UPDATED = 'subscription_updated',
    SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
    PAYMENT_PROCESSED = 'payment_processed',
    PAYMENT_FAILED = 'payment_failed',
    ORGANIZATION_CREATED = 'organization_created',
    ORGANIZATION_UPDATED = 'organization_updated'
}

@Entity('activity_logs')
export class ActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ActivityType
    })
    type: ActivityType;

    @ManyToOne(() => User)
    user: User;

    @Column('jsonb')
    metadata: Record<string, any>;

    @Column({ nullable: true })
    entityId: string;

    @Column({ nullable: true })
    entityType: string;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;
}