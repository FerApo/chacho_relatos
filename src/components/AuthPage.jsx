import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Si ya hay sesión, entra automáticamente a la app
  if (user) {
    navigate('/');
    return null;
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isSignUp && form.password !== form.confirm)
      return setError('Las contraseñas no coinciden');

    const { error } = isSignUp
      ? await supabase.auth.signUp({
          email: form.email,
          password: form.password
        })
      : await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });

    if (error) return setError(error.message);
    navigate('/'); // éxito
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">
        {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
      </h1>

      <button
        onClick={loginWithGoogle}
        className="w-64 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Continuar con Google
      </button>

      <div className="w-64 text-center text-sm text-gray-500">o</div>

      <form onSubmit={handleSubmit} className="flex w-64 flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="Correo"
          required
          value={form.email}
          onChange={handleChange}
          className="rounded border p-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          value={form.password}
          onChange={handleChange}
          className="rounded border p-2"
        />
        {isSignUp && (
          <input
            type="password"
            name="confirm"
            placeholder="Repite la contraseña"
            required
            value={form.confirm}
            onChange={handleChange}
            className="rounded border p-2"
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
        >
          {isSignUp ? 'Registrarse' : 'Entrar'}
        </button>
      </form>

      <button
        className="text-sm text-indigo-600 underline"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError('');
        }}
      >
        {isSignUp
          ? 'Ya tengo cuenta'
          : 'Crear cuenta nueva'}
      </button>
    </div>
  );
}
