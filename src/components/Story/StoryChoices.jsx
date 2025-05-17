import React from 'react';
import { motion } from 'framer-motion';

function StoryChoices({ choices, onChoice, isLoading, isGeneratingImage }) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        choices.map((choice, index) => (
          <motion.button
            key={index}
            onClick={() => onChoice(choice)}
            className="w-full p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all text-left text-gray-800 dark:text-gray-200 hover:bg-indigo-500 hover:text-white transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || isGeneratingImage}
          >
            {choice.text}
          </motion.button>
        ))
      )}
    </div>
  );
}

export default StoryChoices;
