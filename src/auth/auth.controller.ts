import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body()
    body: { username: string; password: string; role: 'DOCTOR' | 'PATIENT' },
  ) {
    const user = await this.authService.signup(body.username, body.password, body.role);
    return { message: 'User created successfully', user: { username: user.username, role: user.role } };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const token = await this.authService.login(body.username, body.password);
    if (!token) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return { accessToken: token };
  }
}
