import { GameSession, Player, Property } from '@/types/game';
import { generateSessionId } from './utils';
import { getMockProperties, fetchRealEstateData } from './mockData';

const STORAGE_KEY = 'homebet_sessions';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function createSessionSync(playerHandle: string): GameSession {
  const sessionId = generateSessionId();
  const now = Date.now();
  
  const session: GameSession = {
    id: sessionId,
    players: [
      {
        id: 'player1',
        handle: playerHandle,
        score: 0,
        guesses: [],
        isReady: true,
        joinedAt: now,
      },
    ],
    properties: getMockProperties(5),
    currentPropertyIndex: 0,
    status: 'waiting',
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  };
  
  saveSession(session);
  return session;
}

export async function createSession(playerHandle: string): Promise<GameSession> {
  // First create a session with mock properties for immediate UI responsiveness
  const session = createSessionSync(playerHandle);
  // Then try to swap in real data in the background
  try {
    const realProps = await fetchRealEstateData({ city: 'Provo', state: 'UT', limit: 5 });
    if (realProps && realProps.length) {
      const updated: GameSession = { ...session, properties: realProps };
      saveSession(updated);
      return updated;
    }
  } catch {
    // ignore, stay with mocks
  }
  return session;
}

export function joinSession(sessionId: string, playerHandle: string): GameSession | null {
  const session = getSession(sessionId);
  
  if (!session || session.status !== 'waiting' || session.players.length >= 2) {
    return null;
  }
  
  const now = Date.now();
  session.players.push({
    id: 'player2',
    handle: playerHandle,
    score: 0,
    guesses: [],
    isReady: true,
    joinedAt: now,
  });
  
  session.status = 'active';
  saveSession(session);
  return session;
}

export function getSession(sessionId: string): GameSession | null {
  if (typeof window === 'undefined') return null;
  
  const sessions = getAllSessions();
  const session = sessions[sessionId];
  
  if (!session) return null;
  
  // Check if session expired
  if (Date.now() > session.expiresAt) {
    deleteSession(sessionId);
    return null;
  }
  
  return session;
}

export function saveSession(session: GameSession): void {
  if (typeof window === 'undefined') return;
  
  const sessions = getAllSessions();
  sessions[session.id] = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function deleteSession(sessionId: string): void {
  if (typeof window === 'undefined') return;
  
  const sessions = getAllSessions();
  delete sessions[sessionId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function getAllSessions(): Record<string, GameSession> {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function updatePlayerGuess(
  sessionId: string,
  playerId: string,
  propertyId: string,
  guessAmount: number,
  points: number,
  accuracy: number
): void {
  const session = getSession(sessionId);
  if (!session) return;
  
  const player = session.players.find(p => p.id === playerId);
  if (!player) return;
  
  player.guesses.push({
    propertyId,
    amount: guessAmount,
    points,
    accuracy,
    timestamp: Date.now(),
  });
  
  player.score += points;
  
  // Check if both players have guessed
  const allGuessed = session.players.every(p => 
    p.guesses.some(g => g.propertyId === propertyId)
  );
  
  if (allGuessed) {
    if (session.currentPropertyIndex < session.properties.length - 1) {
      session.currentPropertyIndex++;
    } else {
      session.status = 'completed';
      // Determine winner
      const [p1, p2] = session.players;
      if (p1.score > p2.score) {
        session.winner = p1.id;
      } else if (p2.score > p1.score) {
        session.winner = p2.id;
      } else {
        // Tie-breaker logic here if needed
        session.winner = 'tie';
      }
    }
  }
  
  saveSession(session);
}
