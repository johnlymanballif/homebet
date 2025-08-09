'use client';

import { motion } from 'framer-motion';
import { Share2, Copy, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { getShareUrl, copyToClipboard } from '@/lib/utils';

interface ShareModalProps {
  sessionId: string;
  onClose: () => void;
  onStart: () => void;
}

export default function ShareModal({ sessionId, onClose, onStart }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(sessionId);

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareUrl);
    setCopied(ok);
    if (!ok) alert('Copy failed. Please copy manually.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'HomeBet - Real Estate Game',
          text: 'Challenge me to guess real estate prices!',
          url: shareUrl,
        });
        return;
      }
    } catch {
      // ignore and fallback
    }
    handleCopy();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Game Created!</h3>
          <p className="text-gray-600">Share this link with your friend to start playing</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm font-mono break-all">{shareUrl}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="py-3 px-4 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl flex items-center justify-center space-x-2"
        >
          <span>Start Playing</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
