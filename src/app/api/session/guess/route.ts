import { NextResponse } from 'next/server';
import { getSessionById, setSession } from '../store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, playerId, propertyId, amount, points, accuracy } = body || {};
    if (!id || !playerId || !propertyId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    const session = getSessionById(id);
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const player = session.players.find((p) => p.id === playerId);
    if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 400 });

    player.guesses.push({ propertyId, amount, points, accuracy, timestamp: Date.now() });
    player.score += Number(points || 0);

    const allGuessed = session.players.every((p) => p.guesses.some((g) => g.propertyId === propertyId));
    if (allGuessed) {
      if (session.currentPropertyIndex < session.properties.length - 1) {
        session.currentPropertyIndex++;
      } else {
        session.status = 'completed';
        const [p1, p2] = session.players;
        if (p1.score > (p2?.score || 0)) session.winner = p1.id;
        else if ((p2?.score || 0) > p1.score) session.winner = p2?.id;
        else session.winner = 'tie';
      }
    }

    setSession(session);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to submit guess' }, { status: 500 });
  }
}

