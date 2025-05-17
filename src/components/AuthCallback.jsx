import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase ya almacena la sesión en localStorage
    supabase.auth.getSession().then(() => navigate('/'));
  }, [navigate]);

  return <p className="p-8">Completando inicio de sesión…</p>;
}
