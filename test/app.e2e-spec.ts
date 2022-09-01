import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { LoginDto, SignupDto } from 'src/auth/dto';

describe('App e2e test', () => {
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
    const payload: SignupDto = {
      name: 'test name',
      email: 'test@email.nest',
      password: 'Test@2022#1',
    };
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
    });
  });
  describe('Bookmarks', () => {
    describe('Create bookmark', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Update bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});
