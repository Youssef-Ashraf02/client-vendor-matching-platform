import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, role: user.role, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d', // or config value
      secret: process.env.REFRESH_TOKEN_SECRET || 'refreshSecret',
    });
    await this.usersService.setRefreshToken(user.id, refreshToken);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');
    const bcrypt = await import('bcrypt');
    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) throw new UnauthorizedException('Invalid refresh token');
    const payload = { sub: user.id, role: user.role, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async logout(userId: number) {
    await this.usersService.clearRefreshToken(userId);
  }
}


