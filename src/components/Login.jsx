import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Autenticación con Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Error de inicio de sesión', description: error.message, variant: 'destructive' });
    } else {
      navigate('/welcome');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950"
    >
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <img 
            src="https://storage.googleapis.com/hostinger-horizons-assets-prod/4ba24024-e026-48d7-a4e4-b28be0a34ffc/48f9ee038bb1133b70ed89d312d32250.png"
            alt="Barco de Vapor Logo"
            className="mx-auto mb-6 w-48 h-auto"
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Barco de Vapor
          </h1>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
          onSubmit={handleLogin}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de usuario
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="Ingresa tu email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Entrar
          </Button>

          <div className="text-center mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">¿No tienes cuenta? </span>
            <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:underline text-sm">Regístrate</button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            App disponible próximamente. Te podrás registrar con tu mail o entrar con tu cuenta de Google.
          </p>
        </motion.form>
      </div>
    </motion.div>
  );
}

export default Login;
