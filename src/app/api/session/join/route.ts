import { NextResponse } from 'next/server';
import { getSessionById, setSession } from '../store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, handle } = body || {};
    if (!id || !handle) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    const session = getSessionById(id);
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (session.status !== 'waiting' || session.players.length >= 2) {
      return NextResponse.json({ error: 'Cannot join' }, { status: 400 });
    }
    const now = Date.now();
    session.players.push({
      id: 'player2',
      handle,
      score: 0,
      guesses: [],
      isReady: true,
      joinedAt: now,
    });
    session.status = 'active';
    setSession(session);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to join' }, { status: 500 });
  }
}

