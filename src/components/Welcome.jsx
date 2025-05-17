import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import TokenDisplay from '@/components/TokenDisplay';
import { getTokenBalance, getCreditBalance, getModelName } from '@/lib/tokenManager';
import BuyTokensModal from '@/components/BuyTokensModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from '/chacho-relatos-logo.png';

function Welcome() {
  const { user } = useAuth();
  const isRegistered = !!user;
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [creditBalance, setCreditBalance] = useState(getCreditBalance(isRegistered));
  const [tokenBalance, setTokenBalance] = useState(getTokenBalance());
  const [username, setUsername] = useState('');
  const [storyType, setStoryType] = useState('genre');
  const [genre, setGenre] = useState('');
  // Preferencia de ilustraciones (establecida antes de iniciar la historia)
  const [useIllustrations, setUseIllustrations] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Actualizar el saldo de tokens cuando el componente se monta
    setTokenBalance(getTokenBalance());
  }, []);
  useEffect(() => {
    setCreditBalance(getCreditBalance(isRegistered));
  }, [isRegistered, showBuyCredits]);

  const handleStart = () => {
    if (!username.trim()) {
      toast({
        title: "¡Espera!",
        description: "Por favor, ingresa tu nombre o alias para comenzar.",
        variant: "destructive",
      });
      return;
    }

    if (storyType === 'genre' && !genre) {
      toast({
        title: "¡Espera!",
        description: "Por favor, selecciona un género para la historia.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('username', username);
    localStorage.setItem('storyType', storyType);
    localStorage.setItem('genre', genre);
    localStorage.setItem('useIllustrations', useIllustrations);
    navigate('/story');
  };

  const handleCustom = () => {
    if (!username.trim()) {
      toast({
        title: "¡Espera!",
        description: "Por favor, ingresa tu nombre o alias para continuar.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('username', username);
    localStorage.setItem('storyType', 'custom');
    navigate('/custom-story');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <img 
            src={logo}
            alt="Chacho Relatos Logo"
            className="mx-auto mb-6 w-48 h-auto"
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Chacho Relatos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Embárcate en una aventura donde tú decides el destino
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu nombre o alias
            </label>
            <input
              type="text"
              id="username"
              maxLength={20}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de historia
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={storyType === 'genre' ? 'default' : 'outline'}
                onClick={() => setStoryType('genre')}
                className="w-full"
              >
                Por género
              </Button>
              <Button
                variant={storyType === 'personal' ? 'default' : 'outline'}
                onClick={() => {
                  setStoryType('personal');
                  setGenre('');
                }}
                className="w-full"
              >
                Historia sobre mí
              </Button>
            </div>
          </div>

          {storyType === 'genre' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Selecciona un género
              </label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elige un género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aventura">Aventura</SelectItem>
                  <SelectItem value="fantasia">Fantasía</SelectItem>
                  <SelectItem value="misterio">Misterio</SelectItem>
                  <SelectItem value="ciencia-ficcion">Ciencia Ficción</SelectItem>
                  <SelectItem value="amor">Romance</SelectItem>
                  <SelectItem value="comedia">Comedia</SelectItem>
                  <SelectItem value="historico">Histórico</SelectItem>
                  <SelectItem value="mitologia">Mitología</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Checkbox para incluir ilustraciones */}
          <div className="mb-4 flex items-center">
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

          <Button 
            onClick={handleCustom}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            Customizar
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleStart}
              className="col-span-2 h-16 text-xl bg-blue-500 hover:bg-blue-600 font-bold shadow-lg"
            >
              Comenzar Aventura
            </Button>
          </div>
          {/* Saldo de créditos y opción de compra */}
          <div className="mt-4 text-center space-y-2">
            <p className="text-gray-800 dark:text-gray-200">{creditBalance} créditos disponibles</p>
            {isRegistered && (
              <Button onClick={() => setShowBuyCredits(true)} className="w-full bg-yellow-500 hover:bg-yellow-600">
                Comprar créditos
              </Button>
            )}
          </div>
          {showBuyCredits && <BuyTokensModal onClose={() => setShowBuyCredits(false)} />}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Welcome;
