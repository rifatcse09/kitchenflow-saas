import { Body, Controller, Post } from '@nestjs/common';
import { StoreService } from '../data/store.service';

interface LoginDto {
  role: 'CUSTOMER' | 'RESTAURANT' | 'ADMIN';
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly storeService: StoreService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.storeService.login(body);
  }
}
