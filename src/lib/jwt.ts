import * as jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
  name: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' } as jwt.SignOptions,
  );
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET!,
  ) as TokenPayload;
}
