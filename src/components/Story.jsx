import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateInitialScene, continueStory, generateEnding } from '@/lib/storyGeneration';
import { useAuth } from '../context/AuthContext';

function Story() {
  const { user } = useAuth();
  const [currentStory, setCurrentStory] = useState(null);
  const [storyHistory, setStoryHistory] = useState([]);
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    const initializeStory = async () => {
      try {
        setIsLoading(true);
        const story = await generateInitialScene(username);
        setCurrentStory(story.text);
        setChoices(story.choices);
        localStorage.setItem('currentStory', story.text);
        localStorage.setItem('storyChoices', JSON.stringify(story.choices));
        localStorage.setItem('storyHistory', JSON.stringify([]));
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo iniciar la historia",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const savedStory = localStorage.getItem('currentStory');
    if (savedStory) {
      setCurrentStory(savedStory);
      setChoices(JSON.parse(localStorage.getItem('storyChoices') || '[]'));
      setStoryHistory(JSON.parse(localStorage.getItem('storyHistory') || '[]'));
    } else {
      initializeStory();
    }
  }, [navigate, username, toast]);

  const handleChoice = async (choice) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const newHistory = [...storyHistory, { text: currentStory, choice }];
      const story = await continueStory(currentStory, choice, username, newHistory);
      
      setStoryHistory(newHistory);
      setCurrentStory(story.text);
      setChoices(story.choices);
      
      localStorage.setItem('currentStory', story.text);
      localStorage.setItem('storyChoices', JSON.stringify(story.choices));
      localStorage.setItem('storyHistory', JSON.stringify(newHistory));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo continuar la historia",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      const story = await generateInitialScene(username);
      setCurrentStory(story.text);
      setChoices(story.choices);
      setStoryHistory([]);
      localStorage.setItem('currentStory', story.text);
      localStorage.setItem('storyChoices', JSON.stringify(story.choices));
      localStorage.setItem('storyHistory', JSON.stringify([]));
      toast({
        title: "Historia reiniciada",
        description: "Comienza una nueva aventura",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reiniciar la historia",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (storyHistory.length === 0) return;

    const newHistory = storyHistory.slice(0, -1);
    const lastStory = newHistory[newHistory.length - 1] || { text: '', choices: [] };
    
    setCurrentStory(lastStory.text);
    setChoices(JSON.parse(localStorage.getItem('storyChoices') || '[]'));
    setStoryHistory(newHistory);
    
    localStorage.setItem('currentStory', lastStory.text);
    localStorage.setItem('storyHistory', JSON.stringify(newHistory));
  };

  const handleSave = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar tu historia.');
      // Aquí podrías abrir un modal o redirigir a /login si lo prefieres
      return;
    }
    // Lógica de guardado aquí
  };

  if (!currentStory) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {username}
          </h2>
          <div className="space-x-2">
            {storyHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isLoading}
              >
                Atrás
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isLoading}
            >
              Nueva Historia
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              {currentStory}
            </p>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all text-left text-gray-800 dark:text-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                  >
                    {choice.text}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Story;
