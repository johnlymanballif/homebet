'use client';

import { GameSession } from '@/types/game';
import { motion } from 'framer-motion';
import { Trophy, User } from 'lucide-react';

interface ScoreBoardProps {
  session: GameSession;
}

export default function ScoreBoard({ session }: ScoreBoardProps) {
  const sortedPlayers = [...session.players].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <span>Scoreboard</span>
        </h2>
        <span className="text-sm text-gray-600">
          Round {session.currentPropertyIndex + 1} of {session.properties.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${
              index === 0 && player.score > 0
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400'
                : 'bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index === 0 && player.score > 0
                  ? 'bg-yellow-400 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{player.handle}</p>
                <p className="text-2xl font-bold text-primary-600">
                  {player.score} pts
                </p>
              </div>
            </div>
            
            {/* Recent Guesses */}
            {player.guesses.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Accuracy:</p>
                <div className="flex space-x-1">
                  {player.guesses.slice(-3).map((guess, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${
                        guess.accuracy >= 95
                          ? 'bg-green-500'
                          : guess.accuracy >= 90
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
