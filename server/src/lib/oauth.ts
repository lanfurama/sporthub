import { env } from '../config/env';
import { prisma } from './prisma';
import { signAccessToken, signRefreshToken } from './jwt';
import { AppError } from '../middleware/error.middleware';

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function getGoogleAuthUrl(): Promise<string> {
  const redirectUri = `${env.CLIENT_URL}/auth/google/callback`;
  const scope = 'openid email profile';
  
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleUserInfo> {
  const redirectUri = `${env.CLIENT_URL}/auth/google/callback`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    throw new AppError(400, 'OAUTH_ERROR', 'Không thể xác thực với Google');
  }

  const tokens = await tokenResponse.json() as { access_token: string };
  const { access_token } = tokens;

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userInfoResponse.ok) {
    throw new AppError(400, 'OAUTH_ERROR', 'Không thể lấy thông tin người dùng');
  }

  return (await userInfoResponse.json()) as GoogleUserInfo;
}

export async function findOrCreateGoogleUser(googleUser: GoogleUserInfo) {
  const { sub: providerUid, email, name, picture } = googleUser;

  let oauthAccount = await prisma.oauthAccount.findUnique({
    where: {
      provider_providerUid: {
        provider: 'google',
        providerUid,
      },
    },
    include: { user: true },
  });

  if (oauthAccount) {
    return oauthAccount.user;
  }

  let user = await prisma.user.findUnique({
    where: { email: email ?? undefined },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'guest',
        isActive: true,
      },
    });
  }

  await prisma.oauthAccount.create({
    data: {
      userId: user.id,
      provider: 'google',
      providerUid,
      email,
      accessToken: '', // Store encrypted if needed
    },
  });

  return user;
}

export async function handleGoogleCallback(code: string) {
  const googleUser = await exchangeGoogleCode(code);
  const user = await findOrCreateGoogleUser(googleUser);

  const accessToken = signAccessToken({ id: user.id, role: user.role, name: user.name });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role, name: user.name });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 900,
    },
  };
}
