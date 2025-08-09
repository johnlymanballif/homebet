import { NextResponse } from 'next/server';
import type { GameSession } from '@/types/game';
import { setSession, getSessionById } from '../store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = body?.session as GameSession | undefined;
    if (!session?.id) return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    if (getSessionById(session.id)) return NextResponse.json({ ok: true, restored: false });
    setSession(session);
    return NextResponse.json({ ok: true, restored: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to rehydrate' }, { status: 500 });
  }
}

