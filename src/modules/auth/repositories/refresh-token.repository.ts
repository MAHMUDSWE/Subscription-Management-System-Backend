import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from '../../../entities/refresh-token.entity';
import { User } from '../../../entities/user.entity';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
    constructor(private dataSource: DataSource) {
        super(RefreshToken, dataSource.createEntityManager());
    }

    async createRefreshToken(user: Omit<User, 'password'>, token: string, expiresIn: number): Promise<RefreshToken> {
        const refreshToken = this.create({
            user,
            token,
            expiresAt: new Date(Date.now() + expiresIn * 1000),
            isRevoked: false,
        });

        return this.save(refreshToken);
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.findOne({
            where: { token },
            relations: ['user'],
        });
    }

    async revokeToken(id: string): Promise<void> {
        await this.update(id, { isRevoked: true });
    }

    async removeExpiredTokens(): Promise<void> {
        await this.delete({
            expiresAt: new Date(Date.now()),
        });
    }
}