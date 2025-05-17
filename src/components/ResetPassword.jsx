import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '../lib/supabaseClient';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Email enviado', description: 'Revisa tu bandeja para restablecer la contraseña.' });
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">Restablecer contraseña</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          />
          <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            {loading ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline text-sm">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;