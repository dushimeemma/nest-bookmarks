import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { SignupDto } from 'src/auth/dto';
import { BookmarkDto } from 'src/bookmark/dto';

describe('App e2e test', () => {
  const payload: SignupDto = {
    name: 'test name',
    email: 'test@email.nest',
    password: 'Test@2022#1',
  };
  const bookmark: BookmarkDto = {
    title: 'Bookmark one',
    description: 'Bookmark description',
    link: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  };
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    await app.listen(8080);
    pactum.request.setBaseUrl('http://localhost:8080');
  });
  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    describe('Signup', () => {
      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(payload)
          .expectStatus(201);
      });
      it('Should not signup with existing email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(payload)
          .expectStatus(403);
      });
    });
    describe('Login', () => {
      it('Should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: payload.email, password: payload.password })
          .expectStatus(200)
          .stores('token', 'token');
      });
      it('Should not login with wrong password', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: payload.email, password: 'NewYear@2023' })
          .expectStatus(403);
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should not get me when I am not authorized', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
      it('should get me', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200);
      });
      it('should update me', () => {
        return pactum
          .spec()
          .patch('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody({ name: payload.name })
          .expectStatus(200);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Create bookmark', () => {
      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody(bookmark)
          .expectStatus(201);
      });
      it('should not create a bookmark when you are not authorized', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(bookmark)
          .expectStatus(401);
      });
      it('should not create a bookmark when title is not provided', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody({ description: bookmark.description, link: bookmark.link })
          .expectStatus(400);
      });
    });
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(200)
          .stores('id', 'data[0].id');
      });
      it('should not get bookmarks when you are not authorized', () => {
        return pactum.spec().get('/bookmarks').expectStatus(401);
      });
    });
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{id}')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(200);
      });
      it('should not get bookmark when id is not found', () => {
        return pactum
          .spec()
          .get('/bookmarks/-1')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(404);
      });
    });
    describe('Update bookmark', () => {
      it('should update bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/$S{id}')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody({ title: bookmark.title })
          .expectStatus(200);
      });
      it('should not update bookmark when not found', () => {
        return pactum
          .spec()
          .patch('/bookmarks/-1')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .withBody({ title: bookmark.title })
          .expectStatus(404);
      });
    });
    describe('Delete bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{id}')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(204);
      });
      it('should not delete bookmark when not found', () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{id}')
          .withHeaders({ Authorization: 'Bearer $S{token}' })
          .expectStatus(404);
      });
    });
  });
});
