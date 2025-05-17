import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coins, CreditCard } from 'lucide-react';
import { applyCreditPromoCode } from '@/lib/tokenManager';
import { createCheckoutSession, STRIPE_PRICES } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

function BuyTokensModal({ onClose }) {
  const { user } = useAuth();
  const isRegistered = !!user;
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async (pack) => {
    try {
      setIsProcessing(true);
      const priceId = 'price_1RKN9n4b3EUDOM1gZ9XfLpSa';
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Respuesta inválida del servidor');
      }
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'No se pudo crear la sesión de pago');
      }
    } catch (error) {
      toast({
        title: "Error en el proceso de pago",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromoCode = () => {
    if (applyCreditPromoCode(promoCode, isRegistered)) {
      toast({
        title: "¡Código promocional aplicado!",
        description: "Se han añadido créditos a tu saldo",
        variant: "success",
      });
      onClose();
    } else {
      toast({
        title: "Código no válido",
        description: "Código inválido o ya usado",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Comprar Créditos
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            1 crédito = 1 uso (ver condiciones)
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Elige un paquete de créditos para seguir creando historias
          </p>
        </div>

        <div className="space-y-4">
          {/* Solo un producto: 1000 créditos por 5€ */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                  <Coins className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    1000 créditos
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    1000 créditos para crear historias e imágenes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  €5.00
                </p>
              </div>
            </div>
            <Button
              onClick={() => handlePurchase({ amount: 1000, price: 5 })}
              disabled={isProcessing}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Procesando...' : 'Comprar'}
            </Button>
          </motion.div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <ul className="list-disc ml-4">
            <li>Coste por trama sin imagen: <b>3 créditos</b></li>
            <li>Coste por trama con imagen: <b>8 créditos</b></li>
          </ul>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Código promocional"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button
              onClick={handlePromoCode}
              disabled={isProcessing}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Aplicar
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          className="w-full"
        >
          Cerrar
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default BuyTokensModal;
