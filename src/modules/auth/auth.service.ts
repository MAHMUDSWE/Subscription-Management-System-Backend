import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiration: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenExpiration = 30 * 24 * 60 * 60; // 30 days in seconds
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByEmail(email);

    const isPasswordValid = user && await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.validateUser(email, password,);

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    await this.refreshTokenRepository.createRefreshToken(
      user,
      refreshToken,
      this.refreshTokenExpiration,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const token = await this.refreshTokenRepository.findByToken(refreshToken);

    if (!token || token.isRevoked || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { user } = token;
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = uuidv4();

    // Revoke old refresh token and create new one
    await this.refreshTokenRepository.revokeToken(token.id);
    await this.refreshTokenRepository.createRefreshToken(
      user,
      newRefreshToken,
      this.refreshTokenExpiration,
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const token = await this.refreshTokenRepository.findByToken(refreshToken);
    if (token) {
      await this.refreshTokenRepository.revokeToken(token.id);
    }
    return { message: 'Logged out successfully' };
  }
}