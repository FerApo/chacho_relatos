import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

function SavedStories() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="max-w-xl w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
        <img src="https://storage.googleapis.com/hostinger-horizons-assets-prod/4ba24024-e026-48d7-a4e4-b28be0a34ffc/48f9ee038bb1133b70ed89d312d32250.png" alt="Chacho Relatos Logo" className="mx-auto mb-6 w-20 h-auto" />
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Tus historias guardadas</h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
          Servicio disponible <span className="font-bold text-indigo-600">próximamente</span>.<br/>
          Aquí podrás ver todas tus historias, imprimirlas en PDF o compartirlas con tus amigos.
        </p>
        <Button onClick={() => window.history.back()} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
          Volver
        </Button>
      </div>
    </div>
  );
}

export default SavedStories;
