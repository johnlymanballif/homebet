import { NextResponse } from 'next/server';
import { generateSessionId } from '@/lib/utils';
import type { GameSession } from '@/types/game';
import { setSession, getSessionById } from './store';
import { getMockProperties, fetchRealEstateData } from '@/lib/mockData';

function getBaseUrlFromRequest(req: Request): string {
  try {
    const url = new URL(req.url);
    // Prefer forwarded headers if available
    const proto = (req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')).trim();
    const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host).trim();
    return `${proto}://${host}`;
  } catch {
    return '';
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { handle, city = 'Provo', state = 'UT', limit = 5 } = body || {};
    if (!handle || String(handle).trim().length < 2) {
      return NextResponse.json({ error: 'Invalid handle' }, { status: 400 });
    }
    const now = Date.now();
    const id = generateSessionId();
    const mockProps = getMockProperties(limit);
    const session: GameSession = {
      id,
      players: [
        {
          id: 'player1',
          handle,
          score: 0,
          guesses: [],
          isReady: true,
          joinedAt: now,
        },
      ],
      properties: mockProps,
      currentPropertyIndex: 0,
      status: 'waiting',
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    setSession(session);

    // Background swap-in of real properties
    const baseUrl = getBaseUrlFromRequest(request);
    fetchRealEstateData({ city, state, limit, baseUrl })
      .then((real) => {
        if (real && real.length) {
          setSession({ ...session, properties: real });
        }
      })
      .catch(() => {});

    return NextResponse.json({ sessionId: id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create session' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const session = getSessionById(id);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ session });
}

