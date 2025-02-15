import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';

export enum OrganizationType {
  SCHOOL = 'school',
  COACHING = 'coaching',
  ACADEMY = 'academy',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: OrganizationType,
  })
  type: OrganizationType;

  @Column()
  description: string;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyFee: number;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => Subscription, (subscription) => subscription.organization)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}