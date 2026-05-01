import React, { useState } from 'react';
import { LogIn, Home, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 border-4 border-slate-900 shadow-brutal-lg max-w-sm w-full"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-emerald-500 border-4 border-slate-900 shadow-brutal flex items-center justify-center mb-6">
            <Home className="text-white" size={40} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-emerald-500 decoration-8 underline-offset-4">Casa em Dia</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-6">Acesso ao Sistema</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-900 rounded-none focus:bg-white outline-none text-sm font-bold placeholder:text-slate-300"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-900 rounded-none focus:bg-white outline-none text-sm font-bold placeholder:text-slate-300"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="brutalist-button w-full flex items-center justify-center gap-3 py-4 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <LogIn size={20} strokeWidth={3} />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </motion.div>
    </div>
  );
}
