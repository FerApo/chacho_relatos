import React from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';

function CreditDisplay({ balance }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
    >
      <Coins className="w-4 h-4 text-yellow-500" />
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {balance} créditos
      </span>
    </motion.div>
  );
}

export default CreditDisplay;
