'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedScoreProps {
  score: number;
}

export default function AnimatedScore({ score }: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 20;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-accent-purple bg-clip-text text-transparent"
    >
      +{displayScore}
    </motion.div>
  );
}
