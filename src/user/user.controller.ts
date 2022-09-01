import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { User as GetUser } from '../auth/decorator';

import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor() {}
  @Get('me')
  async getMe(@GetUser() user: User) {
    return {
      message: 'User profile retrieved successfully',
      data: user,
    };
  }
}
