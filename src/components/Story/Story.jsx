import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { generateInitialScene, continueStory, generateEnding, generateTitle } from '@/lib/storyGeneration';
import { getTokenBalance } from '@/lib/tokenManager';
import { generateIllustration } from '@/lib/imageGeneration';
import StoryControls from './StoryControls';
import StoryChoices from './StoryChoices';
import LoadingIndicator from './LoadingIndicator';
import BuyTokensModal from '@/components/BuyTokensModal';
import { supabase } from '../../lib/supabaseClient';

function Story() {
  const [currentScene, setCurrentScene] = useState(null);
  const [storyHistory, setStoryHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  // Flag para desactivar opciones mientras se genera la imagen
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const username = localStorage.getItem('username');
  const initialized = useRef(false);

  // Leer preferencia de ilustraciones guardada en la página de inicio
  const [useIllustrations] = useState(() => {
    const stored = localStorage.getItem('useIllustrations');
    return stored === 'false' ? false : true;
  });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!username) {
      navigate('/');
      return;
    }

    const initializeStory = async () => {
      try {
        setIsLoading(true);
        localStorage.removeItem('currentScene');
        localStorage.removeItem('storyHistory');
        const scene = await generateInitialScene(username);
        setCurrentScene(scene);
        setStoryHistory([]);
        setIsEnding(false);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStory();
  }, [navigate, username]);

  /* ──────────────────────────────────────────
      ➊  Generar ilustración SOLO si el checkbox
         está activo.  Cancela peticiones previas.
   ────────────────────────────────────────── */
  useEffect(() => {
    let cancelado = false;
    let timerId;

    (async () => {
      if (currentScene && currentScene.text && useIllustrations) {
        setIsGeneratingImage(true);
        setImageUrl(null); // Limpia mientras carga
        setImageError(false); // Limpia error anterior

        // Retraso para garantizar que el texto esté listo
        timerId = setTimeout(async () => {
          if (cancelado) {
            setIsGeneratingImage(false);
            return;
          }
          try {
            const result = await generateIllustration(currentScene.text);
            // Solo asigna la imagen si no se ha cancelado
            if (!cancelado && result?.url) {
              setImageUrl(result.url);
              setImageError(false);
            } else if (!cancelado) {
              setImageUrl(null);
              setImageError(true);
            }
          } catch {
            if (!cancelado) {
              setImageUrl(null);
              setImageError(true);
            }
          } finally {
            setIsGeneratingImage(false);
          }
        }, 500); // 500ms de retardo
      } else {
        /*  Checkbox desactivado → sin ilustración */
        setImageUrl(null);
        setImageError(false);
      }
    })();

    // Si antes de terminar llega otra escena, cancelamos esta generación
    return () => {
      cancelado = true;
      setIsGeneratingImage(false);
      if (timerId) clearTimeout(timerId);
    };
  }, [currentScene, useIllustrations]);

  const handleError = (error) => {
    if (error.message === 'INSUFFICIENT_TOKENS') {
      setShowBuyTokens(true);
      toast({
        title: "Te has quedado sin monedas",
        description: "Compra más monedas para seguir creando historias",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChoice = async (choice) => {
    if (isLoading || isEnding) return;

    try {
      setIsLoading(true);
      const newHistory = [...storyHistory, currentScene];
      const nextScene = await continueStory(
        currentScene.text,
        choice.text,
        username,
        newHistory.map(scene => scene.text)
      );

      setStoryHistory(newHistory);
      setCurrentScene(nextScene);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // 1️⃣ Upsert user by username
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .upsert({ username }, { onConflict: 'username' })
        .select('id')
        .single();
      if (userErr) throw userErr;
      const userId = userRow.id;
      // 2️⃣ Prepare full story text and title
      const scenes = [...storyHistory, currentScene];
      const fullText = scenes.map(s => s.text).join('\n\n');
      const title = await generateTitle(fullText, username);
      // 3️⃣ Insert story header
      const { data: storyRow, error: storyErr } = await supabase
         .from('stories')
         .insert({ user_id: userId, title })
         .select('id')
         .single();
      if (storyErr) throw storyErr;
      const storyId = storyRow.id;
      // 4️⃣ Insert scenes in bulk
      const scenesPayload = scenes.map((scene, idx) => ({
        story_id: storyId,
        order_index: idx,
        scene_text: scene.text,
        image_url: scene.imageUrl || null
      }));
      const { error: scenesErr } = await supabase.from('scenes').insert(scenesPayload);
      if (scenesErr) throw scenesErr;
      toast({ title: '¡Historia guardada en Supabase!' });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndStory = async () => {
    if (isLoading || isEnding) return;

    try {
      setIsLoading(true);
      const newHistory = [...storyHistory, currentScene];
      const endingScene = await generateEnding(
        currentScene.text,
        username,
        newHistory.map(scene => scene.text)
      );

      setStoryHistory(newHistory);
      setCurrentScene(endingScene);
      setIsEnding(true);

      // Guardar automáticamente la historia al finalizarla
      await handleSave();

      toast({
        title: "¡Historia completada!",
        description: "Tu historia ha sido guardada y puedes verla en 'Tus Historias'",
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (storyHistory.length === 0 || isEnding) return;

    const previousScene = storyHistory[storyHistory.length - 1];
    const newHistory = storyHistory.slice(0, -1);
    
    setCurrentScene(previousScene);
    setStoryHistory(newHistory);
    setIsEnding(false);
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('currentScene');
      localStorage.removeItem('storyHistory');
      const scene = await generateInitialScene(username);
      setCurrentScene(scene);
      setStoryHistory([]);
      setIsEnding(false);
      
      toast({
        title: "Historia reiniciada",
        description: "Comienza una nueva aventura",
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentScene || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <LoadingIndicator username={username} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl"
      >
        {/* Ilustraciones configuradas en página inicial */}

        <StoryControls
          username={username}
          history={storyHistory}
          onBack={handleBack}
          onReset={handleReset}
          onEndStory={handleEndStory}
          isEnding={isEnding}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.text}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center w-full">
              {/* Imagen arriba del texto */}
              {imageError ? (
                <div className="w-full flex justify-center mb-4">
                  <div className="w-full h-64 flex items-center justify-center border-2 border-red-400 bg-red-100 text-red-700 rounded-lg text-center">
                    No se pudo generar la imagen
                  </div>
                </div>
              ) : imageUrl && (
                <div className="w-full flex justify-center mb-4">
                  <img
                    src={imageUrl}
                    alt="Ilustración generada por IA"
                    className="rounded-lg shadow"
                    style={{ width: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
              <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed w-full">
                {currentScene.text}
              </p>
            </div>
            {!isEnding && (
              <StoryChoices
                choices={currentScene.choices}
                onChoice={handleChoice}
                isLoading={isLoading}
                isGeneratingImage={isGeneratingImage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {showBuyTokens && (
        <BuyTokensModal onClose={() => setShowBuyTokens(false)} />
      )}
    </div>
  );
}

export default Story;
