import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { User as GetUser } from '../auth/decorator';

import { JwtGuard } from '../auth/guard';
import { UpdatedUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  async getMe(@GetUser() user: User) {
    return {
      message: 'User profile retrieved successfully',
      data: user,
    };
  }
  @Patch('me')
  updateUser(@GetUser() user: User, @Body() updatedUser: UpdatedUserDto) {
    return this.userService.updateUser(user.id, updatedUser);
  }
}
