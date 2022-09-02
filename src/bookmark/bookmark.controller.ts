import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { User as GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { BookmarkService } from './bookmark.service';
import { BookmarkDto, UpdateBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Post()
  createBookmark(@GetUser() user: User, @Body() bookmark: BookmarkDto) {
    return this.bookmarkService.createBookmark(user.id, bookmark);
  }

  @Get()
  getBookmarks(@GetUser() user: User) {
    return this.bookmarkService.getBookmarks(user.id);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookmarkService.getBookmarkById(id, user.id);
  }

  @Patch(':id')
  updateBookmarkById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedBookmark: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmarkById(
      id,
      updatedBookmark,
      user.id,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(id, user.id);
  }
}
