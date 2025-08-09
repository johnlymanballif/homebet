'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DollarSign, Send } from 'lucide-react';

interface PriceInputProps {
  onSubmit: (price: number) => void;
  disabled?: boolean;
  currentValue: number | null;
}

export default function PriceInput({ onSubmit, disabled, currentValue }: PriceInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  const quickAmounts = [
    250000, 350000, 450000, 550000, 650000, 750000
  ];

  const handleSubmit = () => {
    const price = parseInt(inputValue.replace(/[^0-9]/g, ''));
    if (price && price > 0) {
      onSubmit(price);
      setInputValue('');
    }
  };

  const handleQuickAmount = (amount: number) => {
    if (!disabled) {
      onSubmit(amount);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const formatted = parseInt(value).toLocaleString();
      setInputValue(formatted);
    } else {
      setInputValue('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <h3 className="text-xl font-bold mb-4">Your Price Guess</h3>
      
      {disabled ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-600">Waiting for other player...</p>
        </div>
      ) : (
        <>
          {/* Custom Input */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter your guess"
              className="w-full pl-12 pr-4 py-4 text-2xl font-semibold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!inputValue}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span>Submit Guess</span>
            <Send className="w-5 h-5" />
          </motion.button>

          {/* Quick Amounts */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">Quick amounts:</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAmount(amount)}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  {formatPrice(amount)}
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
