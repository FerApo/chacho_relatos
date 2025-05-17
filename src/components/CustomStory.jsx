import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import logo from '/chacho-relatos-logo.png';

function CustomStory() {
  const [storyPrompt, setStoryPrompt] = useState('');
  const [useIllustrations, setUseIllustrations] = useState(() => {
    const stored = localStorage.getItem('useIllustrations');
    return stored === null ? true : stored === 'true';
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const username = localStorage.getItem('username');

  const handleStart = () => {
    if (!storyPrompt.trim()) {
      toast({
        title: "¡Espera!",
        description: "Por favor, escribe cómo quieres que empiece tu historia.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('customPrompt', storyPrompt);
    localStorage.setItem('useIllustrations', useIllustrations);
    navigate('/story');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <img 
            src={logo}
            alt="Chacho Relatos Logo"
            className="mx-auto mb-6 w-32 h-auto"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Sobre qué quieres comenzar tu aventura?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Puedes escribir cómo quieres que empiece la historia: describe una situación, un personaje, un lugar, un conflicto… Si quieres, añade nombres de personajes (hombres, mujeres, animales, lo que quieras). ¡Tu imaginación marca el rumbo!
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <textarea
            className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            placeholder="Ej: Quiero una historia sobre un ratón que explora planetas en una nave hecha de queso..."
          />

          <div className="mb-2 flex items-center">
            <input
              id="use-illustrations"
              type="checkbox"
              checked={useIllustrations}
              onChange={e => setUseIllustrations(e.target.checked)}
              className="mr-2 accent-indigo-600"
            />
            <label htmlFor="use-illustrations" className="text-gray-800 dark:text-gray-200 select-none">
              Incluir ilustraciones
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              onClick={handleStart}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              Comenzar tu aventura
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CustomStory;
