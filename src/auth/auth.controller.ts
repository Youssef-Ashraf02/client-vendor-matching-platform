import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { IsEmail, IsString, IsNotEmpty, IsNumber } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class RefreshDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.userId, dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: { userId: number }) {
    return this.authService.logout(dto.userId);
  }
}


