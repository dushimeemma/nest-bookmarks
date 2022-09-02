import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBookmarkDto, BookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(id: number, bookmark: BookmarkDto) {
    const newBookmark = await this.prisma.bookmark.create({
      data: { ...bookmark, userId: id },
    });
    return {
      message: 'Bookmark created successfully',
      data: newBookmark,
    };
  }

  async getBookmarks(id: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: id },
    });
    return {
      message: 'Bookmarks retrieved successfully',
      data: bookmarks,
    };
  }

  async getBookmarkById(id: number, userId: number) {
    const bookmark = await this.findBookmarkById(id, userId);
    return {
      message: 'Bookmark retrieved successfully',
      data: bookmark,
    };
  }

  async updateBookmarkById(
    id: number,
    updatedBookmark: UpdateBookmarkDto,
    userId: number,
  ) {
    const bookmark = await this.findBookmarkById(id, userId);
    const updatedBookmarkRecord = await this.prisma.bookmark.update({
      where: { id: bookmark.id },
      data: { ...updatedBookmark },
    });

    return {
      message: 'Bookmark updated successfully',
      data: updatedBookmarkRecord,
    };
  }

  async deleteBookmarkById(id: number, userId: number) {
    const bookmark = await this.findBookmarkById(id, userId);
    await this.prisma.bookmark.delete({ where: { id: bookmark.id } });
    return {
      message: 'Bookmark deleted successfully',
      data: {},
    };
  }

  private async findBookmarkById(id: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({ where: { id } });
    if (!bookmark) throw new NotFoundException('No bookmark found');
    if (bookmark.userId !== userId)
      throw new ForbiddenException('Access denied');
    return bookmark;
  }
}
