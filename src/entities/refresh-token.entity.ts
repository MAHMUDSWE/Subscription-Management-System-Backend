import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    token: string;

    @Column()
    expiresAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    isRevoked: boolean;

    @CreateDateColumn()
    createdAt: Date;
}