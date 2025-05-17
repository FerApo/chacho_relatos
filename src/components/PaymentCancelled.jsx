
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center"
        >
          <XCircle className="w-10 h-10 text-red-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pago cancelado
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          El proceso de pago ha sido cancelado. No se ha realizado ningún cargo.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/story')}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Volver a la historia
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/welcome')}
            className="w-full"
          >
            Ir al inicio
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default PaymentCancelled;
