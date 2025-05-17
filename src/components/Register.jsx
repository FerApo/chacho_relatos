import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import logo from '/chacho-relatos-logo.png';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // 1. Registro en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    toast({
      title: "Registro exitoso",
      description: "Revisa tu correo para confirmar tu cuenta.",
    });
    navigate("/");
  };

  // Registro con Google
  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <img src={logo} alt="Chacho Relatos Logo" className="mx-auto w-32 h-auto mb-4 drop-shadow" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Crear cuenta</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            Crea tu cuenta para crear tus historias y te regalamos <span className="text-green-600 font-bold">250 créditos</span> ;)
          </p>
        </div>
        <Button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg shadow mb-4 transition"
        >
          <img src="/Google.svg.png" alt="Google" className="w-6 h-6" />
          Continuar con Google
        </Button>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          <span className="text-gray-500 text-sm">o con tu email</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">¿Ya tienes cuenta? </span>
          <button onClick={() => navigate("/")} className="text-blue-600 hover:underline text-sm">Inicia sesión</button>
        </div>
      </div>
    </div>
  );
}

export default Register;