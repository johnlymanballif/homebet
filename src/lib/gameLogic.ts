import { ScoreCalculation, Property, Guess } from '@/types/game';

export function calculateScore(
  actualPrice: number,
  guessPrice: number
): ScoreCalculation {
  const difference = Math.abs(actualPrice - guessPrice);
  const accuracy = ((actualPrice - difference) / actualPrice) * 100;
  const percentageOff = (difference / actualPrice) * 100;
  
  let points = 100 * (1 - difference / actualPrice);
  points = Math.max(10, points); // Minimum 10 points
  
  let bonus = false;
  let perfect = false;
  
  if (percentageOff === 0) {
    points = 120;
    perfect = true;
  } else if (percentageOff < 5) {
    points = 110;
    bonus = true;
  }
  
  return {
    points: Math.round(points),
    accuracy: Math.round(accuracy * 100) / 100,
    bonus,
    perfect,
  };
}

export function determineWinner(
  player1Score: number,
  player2Score: number,
  player1Guesses: Guess[],
  player2Guesses: Guess[]
): string | null {
  if (player1Score > player2Score) return 'player1';
  if (player2Score > player1Score) return 'player2';
  
  // Tie-breaker: average accuracy
  const player1AvgAccuracy = player1Guesses.reduce((sum, g) => sum + g.accuracy, 0) / player1Guesses.length;
  const player2AvgAccuracy = player2Guesses.reduce((sum, g) => sum + g.accuracy, 0) / player2Guesses.length;
  
  if (player1AvgAccuracy > player2AvgAccuracy) return 'player1';
  if (player2AvgAccuracy > player1AvgAccuracy) return 'player2';
  
  return null; // True tie
}

export function getPropertyTypeColor(type: Property['propertyType']): string {
  const colors = {
    'Single Family': 'from-blue-500 to-purple-600',
    'Condo': 'from-green-500 to-teal-600',
    'Townhouse': 'from-orange-500 to-red-600',
    'Multi-Family': 'from-pink-500 to-rose-600',
  } as const;
  return (colors as Record<string, string>)[type] || 'from-gray-500 to-gray-600';
}

export function getScoreMessage(calculation: ScoreCalculation): string {
  if (calculation.perfect) return '🎯 Perfect Guess!';
  if (calculation.bonus) return '🔥 So Close! Bonus Points!';
  if (calculation.accuracy >= 90) return '👏 Great Guess!';
  if (calculation.accuracy >= 80) return '👍 Good Guess!';
  if (calculation.accuracy >= 70) return '😊 Not Bad!';
  return '🤔 Keep Trying!';
}
