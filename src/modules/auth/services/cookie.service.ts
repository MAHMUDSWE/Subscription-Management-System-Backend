import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
    private readonly refreshTokenConfig = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    setRefreshTokenCookie(response: Response, token: string): void {
        response.cookie('refreshToken', token, this.refreshTokenConfig);
    }

    clearRefreshTokenCookie(response: Response): void {
        response.clearCookie('refreshToken', {
            ...this.refreshTokenConfig,
            maxAge: undefined,
        });
    }
}