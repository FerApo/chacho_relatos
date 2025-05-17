import React from 'react';
import { motion } from 'framer-motion';

function StoryImage({ isLoading, imageUrl, altText }) {
  // Si imageUrl ya es un data URL, úsalo tal cual; si no, no mostrar nada
  const isBase64 = imageUrl && imageUrl.startsWith('data:image/');
  return (
    <motion.div
      className="w-full aspect-square mb-6 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isBase64 ? (
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No hay imagen disponible
        </div>
      )}
    </motion.div>
  );
}

export default StoryImage;
