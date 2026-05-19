import { NextRequest } from 'next/server';
import { getGoogleAuthUrl } from '@/src/lib/oauth';
import { ok, handleError } from '@/src/lib/api-response';

export async function GET(_req: NextRequest) {
  try {
    const authUrl = await getGoogleAuthUrl();
    return ok({ authUrl });
  } catch (err) {
    return handleError(err);
  }
}
