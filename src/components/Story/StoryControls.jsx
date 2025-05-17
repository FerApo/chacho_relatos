import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag, BookMarked, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreditDisplay from '@/components/TokenDisplay';
import BuyTokensModal from '@/components/BuyTokensModal';
import { useAuth } from '@/context/AuthContext';
import { getCreditBalance, getModelName } from '@/lib/tokenManager';
import { useToast } from '@/components/ui/use-toast';
import logo from '/chacho-relatos-logo.png';

function StoryControls({ 
  username, 
  history, 
  onBack, 
  onEndStory, 
  isEnding 
}) {
  const { user } = useAuth();
  const isRegistered = !!user;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const creditBalance = getCreditBalance(isRegistered);
  const modelName = getModelName();

  const handleReset = () => {
    localStorage.removeItem('currentScene');
    localStorage.removeItem('storyHistory');
    navigate('/welcome');
  };

  return (
    <div className="flex flex-col gap-4 w-full mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src={logo}
              alt="Chacho Relatos Logo"
              className="w-8 h-8"
            />
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {username}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isRegistered ? 'Usuario registrado' : 'Invitado'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CreditDisplay balance={creditBalance} />
          {isRegistered ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBuyTokens(true)}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-300"
            >
              <Coins className="mr-2 h-4 w-4" />
              Comprar créditos
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Debes registrarte para comprar créditos.')}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border-yellow-300"
            >
              <Coins className="mr-2 h-4 w-4" />
              Comprar créditos
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        {isRegistered && (
          <Button 
            variant="secondary"
            size="sm"
            className="w-full md:w-auto bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => toast({
              title: 'Próximamente',
              description: 'Tus historias guardadas estarán disponibles muy pronto.',
            })}
          >
            <BookMarked className="mr-2 h-4 w-4" />
            Tus Historias
          </Button>
        )}

        {history.length > 0 && (
          <>
            {!isEnding && (
              <Button
                variant="default"
                size="sm"
                onClick={onEndStory}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Flag className="mr-2 h-4 w-4" />
                Finalizar historia
              </Button>
            )}
          </>
        )}

        <Button
          variant="default"
          size="sm"
          onClick={handleReset}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white"
        >
          Volver a empezar Barco de Vapor
        </Button>
      </div>

      {showBuyTokens && (
        <BuyTokensModal onClose={() => setShowBuyTokens(false)} />
      )}
    </div>
  );
}

export default StoryControls;
