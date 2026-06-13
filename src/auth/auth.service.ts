import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

export type UserRole = 'DOCTOR' | 'PATIENT';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private users: User[] = [];
  private nextId = 1;

  constructor(private readonly jwtService: JwtService) {}

  async signup(username: string, password: string, role: UserRole) {
    const normalizedRole = role?.toUpperCase();
    if (normalizedRole !== 'DOCTOR' && normalizedRole !== 'PATIENT') {
      throw new BadRequestException('Role must be DOCTOR or PATIENT');
    }

    const existingUser = this.users.find((user) => user.username === username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: this.nextId++,
      username,
      password: hashedPassword,
      role: normalizedRole as UserRole,
    };

    this.users.push(user);
    return user;
  }

  async validateUser(username: string, password: string) {
    const user = this.users.find((item) => item.username === username);
    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    return passwordMatches ? user : null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: user.username, role: user.role };
    return this.jwtService.sign(payload);
  }
}
