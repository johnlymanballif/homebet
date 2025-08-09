'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { createSession, createSoloSession } from '@/lib/sessionManager';
import { useRouter } from 'next/navigation';
import ShareModal from '@/components/ShareModal';

export default function HomePage() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingSolo, setIsCreatingSolo] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const handleCreateGame = async () => {
    if (!handle.trim() || handle.length < 2) {
      alert('Please enter a handle (at least 2 characters)');
      return;
    }

    setIsCreating(true);
    const session = await createSession(handle);
    setSessionId(session.id);
    setShowShareModal(true);
    setIsCreating(false);
  };

  const handleStartGame = () => {
    router.push(`/game/${sessionId}`);
  };

  const handleCreateSolo = async () => {
    if (!handle.trim() || handle.length < 2) {
      alert('Please enter a handle (at least 2 characters)');
      return;
    }
    setIsCreatingSolo(true);
    try {
      const session = await createSoloSession(handle);
      setSessionId(session.id);
      router.push(`/game/${session.id}`);
    } finally {
      setIsCreatingSolo(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo and Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-purple rounded-2xl shadow-2xl mb-4"
          >
            <Home className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold gradient-text">HomeBet</h1>
          <p className="mt-2 text-gray-600">
            Guess real estate prices with friends!
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white rounded-xl shadow-md"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-primary-500" />
            <p className="text-sm text-gray-600">2 Players</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white rounded-xl shadow-md"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 text-accent-orange" />
            <p className="text-sm text-gray-600">5 Properties</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 bg-white rounded-xl shadow-md"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-accent-purple" />
            <p className="text-sm text-gray-600">No Login</p>
          </motion.div>
        </div>

        {/* Create Game Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Your Handle
            </label>
            <input
              type="text"
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g., Sarah, Mike"
              maxLength={20}
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>{isCreating ? 'Creating Game...' : 'Create New Game'}</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateSolo}
            disabled={isCreatingSolo}
            className="w-full py-4 bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>{isCreatingSolo ? 'Starting Solo...' : 'Play Solo'}</span>
          </motion.button>
        </div>

        {/* Join Game Section */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Have a game link? Paste it in your browser to join!
          </p>
        </div>
      </motion.div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          sessionId={sessionId}
          onClose={() => setShowShareModal(false)}
          onStart={handleStartGame}
        />
      )}
    </main>
  );
}
