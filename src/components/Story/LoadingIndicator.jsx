
import React from 'react';
import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';

function LoadingIndicator({ username }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center space-y-4 p-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <Wand2 className="w-8 h-8 text-purple-500" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
        />
      </motion.div>
      
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-center"
      >
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          ✨ Generando una historia mágica para {username} ✨
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Preparando una aventura única...
        </p>
      </motion.div>

      <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"
          animate={{
            x: [-256, 256],
            background: [
              "linear-gradient(to right, #8B5CF6, #EC4899, #8B5CF6)",
              "linear-gradient(to right, #EC4899, #8B5CF6, #EC4899)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}

export default LoadingIndicator;
