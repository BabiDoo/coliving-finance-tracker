import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Plus, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Notices() {
  const { profile } = useAuth();
  const { notices, addNotice, deleteNotice, expenses, history } = useApp();
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addNotice(content);
    setContent('');
    setIsAdding(false);
  };

  const userPayments = new Set(
    history
      .filter(h => h.user_id === profile?.id)
      .map(h => h.expense_id)
  );

  const systemNotices = expenses
    .filter(e => e.status !== 'paid' && !userPayments.has(e.id))
    .map(e => {
      const dueDate = new Date(e.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return {
          id: `sys-overdue-${e.id}`,
          content: `URGENTE: A conta "${e.description}" está atrasada há ${Math.abs(diffDays)} dia(s)! Valor: R$ ${e.total_amount.toFixed(2)}`,
          author_name: 'SISTEMA',
          created_at: new Date().toISOString(),
          isSystem: true
        };
      } else if (diffDays <= 5) {
        return {
          id: `sys-due-${e.id}`,
          content: `Aviso: A conta "${e.description}" vence em ${diffDays} dia(s) (Dia ${format(dueDate, "dd/MM")}).`,
          author_name: 'SISTEMA',
          created_at: new Date().toISOString(),
          isSystem: true
        };
      }
      return null;
    })
    .filter(Boolean);

  const allNotices = [...systemNotices, ...notices];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-yellow-400 decoration-8 underline-offset-4">Mural</h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">Avisos e comunicados</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-14 h-14 bg-slate-900 text-white border-4 border-slate-900 flex items-center justify-center shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 border-4 border-slate-900 shadow-brutal space-y-4 overflow-hidden"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite seu aviso aqui..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold placeholder:text-slate-300"
              rows={3}
              required
            />
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="brutalist-button py-2 px-6 flex items-center gap-2"
              >
                <Send size={16} strokeWidth={3} />
                <span className="text-xs">Postar</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {allNotices.length === 0 ? (
          <div className="py-20 text-center space-y-4 border-4 border-dashed border-slate-200">
            <Megaphone size={48} className="text-slate-200 mx-auto" />
            <p className="text-slate-300 font-black uppercase tracking-widest">Nenhum aviso no mural</p>
          </div>
        ) : (
          allNotices.map((notice, idx) => (
            <motion.div 
              layout
              key={notice.id}
              initial={{ rotate: idx % 2 === 0 ? -1 : 1 }}
              className={cn(
                "p-6 border-4 border-slate-900 shadow-brutal relative group transition-transform hover:rotate-0",
                notice.isSystem ? "bg-rose-100" : idx % 3 === 0 ? "bg-yellow-100" : idx % 3 === 1 ? "bg-blue-100" : "bg-emerald-100"
              )}
            >
              <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-900 pb-2">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  DE: {notice.isSystem ? "SISTEMA" : notice.author_name}
                </p>
                <span className="text-slate-900/20">•</span>
                <p className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">
                  {format(new Date(notice.created_at), "dd 'de' MMM", { locale: ptBR })}
                </p>
              </div>

              <p className={cn(
                "text-slate-900 text-base leading-tight font-black uppercase tracking-tighter",
                notice.isSystem && "text-rose-600"
              )}>
                "{notice.content}"
              </p>

              {!notice.isSystem && (profile?.id === notice.author_id || profile?.role === 'admin') && (
                <button 
                  onClick={() => deleteNotice(notice.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} strokeWidth={3} />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
