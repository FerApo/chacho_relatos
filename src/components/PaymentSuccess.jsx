
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Aquí se actualizará el saldo de tokens cuando se implemente Supabase
  }, []);

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
          className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ¡Pago completado con éxito!
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          Tu compra se ha procesado correctamente. Las monedas se han añadido a tu saldo.
        </p>

        <Button
          onClick={() => navigate('/story')}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Continuar creando historias
        </Button>
      </motion.div>
    </div>
  );
}

export default PaymentSuccess;
