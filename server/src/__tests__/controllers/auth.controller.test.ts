import { Request, Response, NextFunction } from 'express';
import { register, login, forgotPassword, resetPassword, refresh } from '../../controllers/auth.controller';
import { testHelpers } from '../helpers';
import { AppError } from '../../middleware/error.middleware';
import bcrypt from 'bcrypt';

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = testHelpers.mockRequest();
    res = testHelpers.mockResponse();
    next = testHelpers.mockNext();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      req.body = {
        name: 'New User',
        phone: '0123456789',
        email: 'newuser@example.com',
        password: 'password123',
      };

      await register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              name: 'New User',
              role: 'guest',
            }),
            tokens: expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          }),
        })
      );
    });

    it('should return 409 if email already exists', async () => {
      await testHelpers.createUser({ email: 'existing@example.com' });

      req.body = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
      };

      await register(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await testHelpers.createUser({
        email: 'test@example.com',
        passwordHash,
      });

      req.body = {
        identifier: 'test@example.com',
        password: 'password123',
      };

      await login(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({ id: user.id }),
            tokens: expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          }),
        })
      );
    });

    it('should return 401 with invalid credentials', async () => {
      req.body = {
        identifier: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      await login(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP for existing user', async () => {
      await testHelpers.createUser({ phone: '0123456789' });

      req.body = { phone: '0123456789' };

      await forgotPassword(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should return success even if user not found (security)', async () => {
      req.body = { phone: '9999999999' };

      await forgotPassword(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe('refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = await testHelpers.createUser();
      const { signRefreshToken } = require('../../lib/jwt');
      const refreshToken = signRefreshToken({ id: user.id, role: user.role, name: user.name });

      req.body = { refreshToken };

      await refresh(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            accessToken: expect.any(String),
          }),
        })
      );
    });

    it('should return 401 with invalid refresh token', async () => {
      req.body = { refreshToken: 'invalid-token' };

      await refresh(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
