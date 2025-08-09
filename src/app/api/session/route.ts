import { NextResponse } from 'next/server';
import { generateSessionId } from '@/lib/utils';
import type { GameSession } from '@/types/game';
import { setSession, getSessionById } from './store';
import { getMockProperties, fetchRealEstateData } from '@/lib/mockData';

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
    fetchRealEstateData({ city, state, limit })
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

