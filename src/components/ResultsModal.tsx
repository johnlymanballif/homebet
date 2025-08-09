'use client';

import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { getScoreMessage } from '@/lib/gameLogic';
import { ScoreCalculation } from '@/types/game';
import { X, TrendingUp, Target, Award } from 'lucide-react';
import AnimatedScore from './AnimatedScore';

interface ResultsModalProps {
  actualPrice: number;
  playerGuess: number;
  calculation: ScoreCalculation;
  onClose: () => void;
}

export default function ResultsModal({
  actualPrice,
  playerGuess,
  calculation,
  onClose,
}: ResultsModalProps) {
  const difference = Math.abs(actualPrice - playerGuess);
  const percentOff = (difference / actualPrice) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Results</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Message */}
        <div className="text-center mb-6">
          <p className="text-3xl font-bold mb-2">{getScoreMessage(calculation)}</p>
          {calculation.perfect && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full"
            >
              <Award className="w-5 h-5" />
              <span className="font-semibold">PERFECT!</span>
            </motion.div>
          )}
        </div>

        {/* Price Comparison */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Your Guess</span>
            <span className="text-xl font-semibold">{formatPrice(playerGuess)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <span className="text-gray-600">Actual Price</span>
            <span className="text-xl font-semibold text-primary-600">
              {formatPrice(actualPrice)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Target className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-sm text-gray-600">Accuracy</p>
            <p className="text-xl font-bold">{calculation.accuracy.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-sm text-gray-600">Off By</p>
            <p className="text-xl font-bold">{percentOff.toFixed(1)}%</p>
          </div>
        </div>

        {/* Points Earned */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Points Earned</p>
          <AnimatedScore score={calculation.points} />
        </div>
      </motion.div>
    </motion.div>
  );
}
