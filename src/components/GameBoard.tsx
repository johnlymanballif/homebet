'use client';

import { useState, useEffect } from 'react';
import { GameSession } from '@/types/game';
import PropertyCard from './PropertyCard';
import PriceInput from './PriceInput';
import ScoreBoard from './ScoreBoard';
import ResultsModal from './ResultsModal';
import { calculateScore } from '@/lib/gameLogic';
import { updatePlayerGuess, getSession, getLocalPlayerId } from '@/lib/sessionManager';
import { motion, AnimatePresence } from 'framer-motion';

interface GameBoardProps {
  session: GameSession;
}

export default function GameBoard({ session: initialSession }: GameBoardProps) {
  const [session, setSession] = useState(initialSession);
  const [currentPlayerGuess, setCurrentPlayerGuess] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastResults, setLastResults] = useState<any>(null);
  
  // Determine which player this device is
  const localRole = getLocalPlayerId(session.id);
  const isPlayer1 = localRole === 'player1';
  const currentPlayer = isPlayer1 ? session.players[0] : session.players[1];
  const currentProperty = session.properties[session.currentPropertyIndex];
  
  useEffect(() => {
    // Poll for updates
    const poll = async () => {
      const updatedSession = await getSession(session.id);
      if (updatedSession) {
        setSession(updatedSession);
      }
    };
    const interval = setInterval(poll, 2000);
    
    return () => clearInterval(interval);
  }, [session.id]);

  const handleSubmitGuess = (amount: number) => {
    if (!currentProperty) return;
    
    const calculation = calculateScore(currentProperty.price, amount);
    
    updatePlayerGuess(
      session.id,
      currentPlayer.id,
      currentProperty.id,
      amount,
      calculation.points,
      calculation.accuracy
    );
    
    setLastResults({
      actualPrice: currentProperty.price,
      playerGuess: amount,
      calculation,
    });
    
    setShowResults(true);
    setCurrentPlayerGuess(null);
    
    // Auto-close results after 5 seconds
    setTimeout(() => {
      setShowResults(false);
    }, 5000);
  };

  if (session.status === 'completed') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <h1 className="text-3xl font-bold mb-4">Game Complete!</h1>
          <div className="space-y-4">
            {session.players.map((player) => (
              <div
                key={player.id}
                className={`p-4 rounded-xl ${
                  session.winner === player.id
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <p className="font-semibold text-lg">{player.handle}</p>
                <p className="text-2xl font-bold">{player.score} points</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => (window.location.href = '/')}
            className="mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <ScoreBoard session={session} />
      </div>

      {/* Game Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Property Display */}
        <div>
          <PropertyCard property={currentProperty} hidePrice={true} />
        </div>

        {/* Price Input */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <PriceInput
            onSubmit={handleSubmitGuess}
            disabled={!!currentPlayer.guesses.find(g => g.propertyId === currentProperty.id)}
            currentValue={currentPlayerGuess}
          />
          
          {/* Progress */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-2">Progress</p>
            <div className="flex space-x-2">
              {session.properties.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    index < session.currentPropertyIndex
                      ? 'bg-green-500'
                      : index === session.currentPropertyIndex
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Property {session.currentPropertyIndex + 1} of {session.properties.length}
            </p>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && lastResults && (
          <ResultsModal
            actualPrice={lastResults.actualPrice}
            playerGuess={lastResults.playerGuess}
            calculation={lastResults.calculation}
            onClose={() => setShowResults(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
