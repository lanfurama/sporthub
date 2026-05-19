import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleGoogleCallback } from '@/src/lib/oauth';
import { ok, handleError } from '@/src/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const { code: validated } = z.object({ code: z.string() }).parse({ code });
    const result = await handleGoogleCallback(validated);
    return ok(result);
  } catch (err) {
    return handleError(err);
  }
}
