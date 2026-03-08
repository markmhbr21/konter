import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Bisa 'password' atau 'passwordHash' berdasarkan request (untuk contoh ini plain 'password')
    const pass = loginDto.password || loginDto.passwordHash;
    const user = await this.authService.validateUser(
      loginDto.username,
      pass || '',
    );
    if (!user) {
      throw new UnauthorizedException('Username atau Password salah');
    }
    return this.authService.login(user);
  }

  // Endpoint darurat untuk bikin admin pertama kali (bisa dihapus nanti atau diprotect)
  @Post('register-first-admin')
  async registerAdmin(@Body() body: any) {
    if (body.secretKey !== 'supersecret') {
      throw new UnauthorizedException();
    }
    return this.usersService.createAdmin(
      body.username,
      body.password,
      body.name,
    );
  }
}
