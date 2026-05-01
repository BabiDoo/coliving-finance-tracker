import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, CheckCircle2, Clock, Calendar, HandCoins, Trash2, CheckCircle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function Expenses() {
  const { profile } = useAuth();
  const { expenses, registerPayment, history, deleteExpense, houseMembers } = useApp();
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    onConfirm: () => void;
  } | null>(null);

  if (!profile) return null;

  const handlePay = async (expenseId: string, amount: number) => {
    setLoadingPayment(expenseId);
    await registerPayment(expenseId, amount);
    setLoadingPayment(null);
    setSuccessMessage("Pagamento registrado com sucesso! A Bárbara vai verificar o envio e confirmar o registro no sistema.");
    
    // Remove o aviso após 5 segundos
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleDelete = async (expenseId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Tem certeza que deseja excluir esta conta?",
      onConfirm: async () => {
        await deleteExpense(expenseId);
        setConfirmDialog(null);
      }
    });
  };

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-50 bg-emerald-500 text-white p-4 shadow-brutal-lg border-4 border-slate-900 flex gap-3 items-start"
          >
            <CheckCircle className="shrink-0 mt-0.5" size={24} strokeWidth={3} />
            <p className="text-sm font-black uppercase tracking-tight leading-tight">
              {successMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-blue-500 decoration-8 underline-offset-4">Obrigações</h2>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">Listagem Geral</p>
      </div>

      <div className="space-y-6">
        {expenses.filter(e => e.status !== 'paid').map((expense) => {
          let amountDue = 0;
          if (expense.split_equally) {
            amountDue = expense.total_amount / 3;
          } else {
            amountDue = profile.role === 'admin' ? expense.total_amount * 0.5 : expense.total_amount * 0.25;
          }
          
          // Verificar se o usuário já fez um pagamento para essa conta
          const userPayments = history.filter(h => h.expense_id === expense.id && h.user_id === profile.id);
          const hasPaid = userPayments.length > 0;
          const isConfirmed = userPayments.some(h => h.status === 'confirmed');

          return (
            <div 
              key={expense.id}
              className="bg-white border-4 border-slate-900 shadow-brutal p-6 relative group"
            >
              {profile.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(expense.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center hover:bg-rose-600 transition-colors z-10"
                  title="Excluir Conta"
                >
                  <Trash2 size={16} strokeWidth={3} />
                </button>
              )}

              <div className="flex items-start justify-between mb-6 gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-12 h-12 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center shrink-0",
                    "bg-indigo-100 text-indigo-700"
                  )}>
                    <Clock size={24} strokeWidth={3} />
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight uppercase tracking-tight break-words">{expense.description}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-slate-100 px-1.5 py-0.5 rounded-sm inline-block">
                      {expense.category}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  "shrink-0 px-2 sm:px-3 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-[9px] sm:text-[10px] font-black uppercase tracking-widest h-fit",
                  (expense.status === 'paid' || isConfirmed) ? "bg-emerald-500 text-white" : 
                  expense.status === 'overdue' ? "bg-rose-500 text-white" : "bg-amber-400 text-slate-900"
                )}>
                  {expense.status === 'paid' ? 'Pago Geral' : isConfirmed ? 'Paga' : expense.status === 'overdue' ? 'Atraso' : 'Aberto'}
                </div>
              </div>

              <div className="border-t-2 border-slate-900 pt-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 leading-none">Sua Parte</p>
                  <p className="font-black text-4xl text-blue-600 leading-none tracking-tighter">R$ {amountDue.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Total da Casa</p>
                  <p className="font-black text-sm text-slate-500 leading-none">R$ {expense.total_amount.toFixed(2)}</p>
                </div>
              </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={14} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Venc: {format(new Date(expense.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  
                  {!hasPaid && expense.status !== 'paid' && (
                    <button 
                      onClick={() => handlePay(expense.id, amountDue)}
                      disabled={loadingPayment === expense.id}
                      className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-800 transition-colors disabled:opacity-50 text-xs font-black uppercase tracking-widest active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      <HandCoins size={14} />
                      {loadingPayment === expense.id ? 'Registrando...' : 'Marcar como Pago'}
                    </button>
                  )}

                  {hasPaid && !isConfirmed && (
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200">
                      <Clock size={12} strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Aguardando Confirmação</span>
                    </div>
                  )}

                  {(isConfirmed || expense.status === 'paid') && (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      <CheckCircle2 size={12} strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Confirmado</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t-2 border-slate-900 pt-4">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3">Status de Pagamento</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {houseMembers.map(member => {
                      const memberPaid = history.some(h => h.expense_id === expense.id && h.user_id === member.id && h.status === 'confirmed');
                      return (
                        <div key={member.id} className="flex items-center justify-between bg-white px-3 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                          <span className="text-[10px] font-black uppercase text-slate-900 truncate pr-2">{member.name}</span>
                          {memberPaid ? (
                            <div className="flex items-center justify-center w-5 h-5 bg-emerald-100 border border-emerald-900 text-emerald-700 shrink-0">
                              <Check size={12} strokeWidth={4} />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-5 h-5 bg-rose-100 border border-rose-900 text-rose-700 shrink-0">
                              <X size={12} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
          );
        })}
      </div>

      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-slate-900 shadow-brutal-lg max-w-sm w-full p-6 space-y-6"
            >
              <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter leading-tight">
                {confirmDialog.title}
              </h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-3 border-2 border-slate-900 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-3 bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-colors active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
