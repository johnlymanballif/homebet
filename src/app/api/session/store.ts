import type { GameSession, Guess } from '@/types/game';

// Module-level in-memory store for MVP. For production, replace with Redis/DB.
const globalForSessions = globalThis as unknown as {
  __homebetSessions?: Map<string, GameSession>;
};

export const sessionStore: Map<string, GameSession> =
  globalForSessions.__homebetSessions || (globalForSessions.__homebetSessions = new Map());

export function setSession(session: GameSession) {
  sessionStore.set(session.id, session);
}

export function getSessionById(sessionId: string): GameSession | undefined {
  return sessionStore.get(sessionId);
}

export function deleteSession(sessionId: string) {
  sessionStore.delete(sessionId);
}

