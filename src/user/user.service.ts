import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatedUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateUser(id: number, updatedUser: UpdatedUserDto) {
    const newUserRecord = await this.prisma.user.update({
      where: { id },
      data: updatedUser,
    });
    delete newUserRecord.password;
    return {
      message: 'User record updated successfully',
      data: newUserRecord,
    };
  }
}
