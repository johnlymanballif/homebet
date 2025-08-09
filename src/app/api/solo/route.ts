import { NextResponse } from 'next/server';
import type { GameSession } from '@/types/game';
import { setSession } from '../session/store';
import { getMockProperties, fetchRealEstateData } from '@/lib/mockData';
import { generateSessionId } from '@/lib/utils';

function getBaseUrlFromRequest(req: Request): string {
  try {
    const url = new URL(req.url);
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
    const { handle = 'You', location, city = 'Provo', state = 'UT', limit = 5 } = body || {};
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
      status: 'active',
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    };

    setSession(session);

    const baseUrl = getBaseUrlFromRequest(request);
    fetchRealEstateData({ city, state, limit, baseUrl, location })
      .then((real) => {
        if (real && real.length) {
          setSession({ ...session, properties: real });
        }
      })
      .catch(() => {});

    return NextResponse.json({ sessionId: id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create solo session' }, { status: 500 });
  }
}

