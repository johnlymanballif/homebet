import { GameSession } from '@/types/game';

const LOCAL_PLAYER_KEY_PREFIX = 'homebet_player_';

function getApiBase() {
  return '/api/session';
}

export function getLocalPlayerId(sessionId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LOCAL_PLAYER_KEY_PREFIX + sessionId);
  } catch {
    return null;
  }
}

export function markLocalPlayer(sessionId: string, playerId: 'player1' | 'player2') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PLAYER_KEY_PREFIX + sessionId, playerId);
  } catch {
    /* noop */
  }
}

export async function createSession(handle: string): Promise<GameSession> {
  const res = await fetch(getApiBase(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ handle }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  const { sessionId } = await res.json();
  // Mark this browser as player1
  markLocalPlayer(sessionId, 'player1');
  const session = await getSession(sessionId);
  if (!session) throw new Error('Session not found after creation');
  try {
    // cache in sessionStorage to enable rehydration on cold start
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homebet_last_session', JSON.stringify(session));
    }
  } catch {}
  return session;
}

export async function joinSession(sessionId: string, handle: string): Promise<GameSession | null> {
  const res = await fetch(getApiBase() + '/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: sessionId, handle }),
  });
  if (!res.ok) return null;
  // Mark this browser as player2
  markLocalPlayer(sessionId, 'player2');
  return await getSession(sessionId);
}

export async function getSession(sessionId: string): Promise<GameSession | null> {
  const res = await fetch(getApiBase() + `?id=${encodeURIComponent(sessionId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  const session = (data?.session as GameSession) || null;
  if (!session && typeof window !== 'undefined') {
    // Try to rehydrate server store using a cached copy (if present)
    try {
      const cached = sessionStorage.getItem('homebet_last_session');
      if (cached) {
        const parsed = JSON.parse(cached) as GameSession;
        if (parsed?.id === sessionId) {
          await fetch(getApiBase() + '/rehydrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: parsed }),
          });
          return parsed;
        }
      }
    } catch {}
  }
  return session;
}

export async function updatePlayerGuess(
  sessionId: string,
  playerId: string,
  propertyId: string,
  guessAmount: number,
  points: number,
  accuracy: number
): Promise<boolean> {
  const res = await fetch(getApiBase() + '/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: sessionId, playerId, propertyId, amount: guessAmount, points, accuracy }),
  });
  return res.ok;
}
