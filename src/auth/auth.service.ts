import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: SignupDto) {
    try {
      const { name, email, password } = dto;
      const hash = await argon.hash(password);
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hash,
        },
      });
      delete user.password;
      const token = await this.signToken(user.id, user.email);
      return {
        message: 'Account created successfully',
        token,
        data: user,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email in use with another account');
        }
      }
      throw error;
    }
  }
  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new ForbiddenException('Unauthorized');

    const isEqualPassword = await argon.verify(user.password, password);

    if (!isEqualPassword) throw new ForbiddenException('Unauthorized');

    delete user.password;
    const token = await this.signToken(user.id, user.email);
    return {
      message: 'Logged In successfully',
      token,
      data: user,
    };
  }
  signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
