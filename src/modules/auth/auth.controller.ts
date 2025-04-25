import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CookieService } from './services/cookie.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) { }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    this.cookieService.setRefreshTokenCookie(response, result.refresh_token);
    const { refresh_token, ...rest } = result;
    return rest;
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken(refreshToken);
    this.cookieService.setRefreshTokenCookie(response, result.refresh_token);
    const { refresh_token, ...rest } = result;
    return rest;
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refreshToken'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.cookieService.clearRefreshTokenCookie(response);
    return { message: 'Logged out successfully' };
  }
}