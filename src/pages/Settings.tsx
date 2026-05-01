import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Key, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { profile, signOut } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Para validar a senha atual, tentamos fazer um novo login com ela
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Senha atual incorreta.');
      }

      setIsValidated(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao validar a senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Deslogar automaticamente após 3 segundos para exigir login com nova senha
      setTimeout(() => {
        signOut();
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="px-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-blue-500 decoration-8 underline-offset-4">Perfil</h2>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">Configurações e Segurança</p>
      </div>

      <div className="bg-white p-6 border-4 border-slate-900 shadow-brutal space-y-6">
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-4">
          <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck size={24} strokeWidth={3} />
          </div>
          <div>
            <h3 className="font-black uppercase text-lg leading-tight">Alterar Senha</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{profile?.email}</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-100 border-2 border-rose-500 p-3 flex items-center gap-2 text-rose-700">
            <AlertCircle size={16} strokeWidth={3} className="shrink-0" />
            <p className="text-[10px] font-black uppercase">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-100 border-4 border-emerald-500 p-6 flex flex-col items-center justify-center text-center gap-4"
            >
              <CheckCircle2 size={48} className="text-emerald-500" strokeWidth={3} />
              <div>
                <h4 className="font-black text-lg text-emerald-700 uppercase">Senha Atualizada!</h4>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mt-1">Sua nova senha já está valendo.</p>
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-4">Redirecionando para o login...</p>
              </div>
            </motion.div>
          ) : !isValidated ? (
            <motion.form 
              key="validate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleValidate} 
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                  Confirme sua senha atual
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} strokeWidth={3} />
                  </div>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold placeholder:text-slate-300"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full brutalist-button bg-slate-900 text-white py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={16} strokeWidth={3} />
                    <span className="text-xs">Validar Identidade</span>
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="change"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleChangePassword} 
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key size={16} strokeWidth={3} />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold placeholder:text-slate-300"
                    placeholder="Nova senha"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                  Repita a Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key size={16} strokeWidth={3} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold placeholder:text-slate-300"
                    placeholder="Repita a nova senha"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsValidated(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-3 border-2 border-slate-900 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 brutalist-button bg-emerald-500 text-white py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 size={16} strokeWidth={3} />
                      <span className="text-xs">Confirmar Nova Senha</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
