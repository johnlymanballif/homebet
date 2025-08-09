'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession, joinSession, getLocalPlayerId, markLocalPlayer } from '@/lib/sessionManager';
import GameBoard from '@/components/GameBoard';
import { GameSession } from '@/types/game';
import { motion } from 'framer-motion';
import { Home, Clock } from 'lucide-react';
import { calculateTimeRemaining, copyToClipboard } from '@/lib/utils';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [playerHandle, setPlayerHandle] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [needsToJoin, setNeedsToJoin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      const gameSession = await getSession(sessionId);

      if (!gameSession) {
        if (!cancelled) setError('Session not found or expired');
        return;
      }

      if (!cancelled) setSession(gameSession);

      // Determine if this browser is already associated to player1/2
      const local = getLocalPlayerId(sessionId);
      const isInitiatorPresent = local === 'player1';
      // If initiator opened the link on their device, do not ask to join
      if (!isInitiatorPresent && gameSession.players.length === 1 && gameSession.status === 'waiting') {
        if (!cancelled) setNeedsToJoin(true);
      }
    };

    loadSession();
    
    // Poll for updates
    const interval = setInterval(() => {
      loadSession();
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleJoinGame = async () => {
    if (!playerHandle.trim() || playerHandle.length < 2) {
      alert('Please enter a handle (at least 2 characters)');
      return;
    }

    setIsJoining(true);
    const updatedSession = await joinSession(sessionId, playerHandle);
    
    if (updatedSession) {
      setSession(updatedSession);
      setNeedsToJoin(false);
    } else {
      setError('Unable to join game');
    }
    setIsJoining(false);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            Create New Game
          </button>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (needsToJoin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <h2 className="text-2xl font-bold text-center mb-2">Join Game</h2>
          <p className="text-gray-600 text-center mb-6">
            {session.players[0].handle} is waiting for you!
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Handle
              </label>
              <input
                type="text"
                id="handle"
                value={playerHandle}
                onChange={(e) => setPlayerHandle(e.target.value)}
                placeholder="e.g., Sarah, Mike"
                maxLength={20}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleJoinGame}
              disabled={isJoining}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{calculateTimeRemaining(session.expiresAt)}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (session.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="animate-pulse mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Home className="w-8 h-8 text-primary-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Waiting for Player 2</h2>
          <p className="text-gray-600 mb-6">Share the link to invite a friend!</p>
          
          <div className="p-4 bg-gray-50 rounded-lg break-all text-sm">
            {typeof window !== 'undefined' && `${window.location.origin}/game/${sessionId}`}
          </div>

          <button
            onClick={() => {
              const url = `${window.location.origin}/game/${sessionId}`;
              copyToClipboard(url).then((ok) => {
                if (ok) alert('Link copied!');
                else alert('Copy failed. Please copy manually.');
              });
            }}
            className="mt-4 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            Copy Link
          </button>
        </motion.div>
      </div>
    );
  }

  return <GameBoard session={session} />;
}
