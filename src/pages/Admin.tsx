import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Plus, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Admin() {
  const { expenses, history, addExpense, confirmPayment } = useApp();
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');
  const [splitEqually, setSplitEqually] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const pendingPayments = history.filter(h => h.status === 'pending');
  
  const activeExpenses = expenses.filter(e => e.status !== 'paid');
  const totalGeral = activeExpenses.reduce((s, e) => s + e.total_amount, 0);
  
  const totalPagoAtivas = history
    .filter(h => h.status === 'confirmed' && activeExpenses.some(e => e.id === h.expense_id))
    .reduce((s, h) => s + h.amount_paid, 0);

  const totalAberto = totalGeral - totalPagoAtivas;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !totalAmount || !dueDate) return;

    await addExpense({
      description,
      total_amount: parseFloat(totalAmount),
      due_date: dueDate,
      status: 'pending',
      category: category || 'Outros',
      split_equally: splitEqually,
      is_recurring: isRecurring
    });

    // Reset form
    setDescription('');
    setTotalAmount('');
    setDueDate('');
    setSplitEqually(false);
    setIsRecurring(false);
    setIsAdding(false);
  };

  const handleConfirm = async (paymentId: string) => {
    await confirmPayment(paymentId);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-amber-500 decoration-8 underline-offset-4 flex items-center gap-2">
            ADMIN <ShieldCheck className="text-amber-500" size={32} strokeWidth={3} />
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4">Controle Geral da Casa</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-16 h-16 bg-amber-500 text-white border-4 border-slate-900 flex items-center justify-center shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          <Plus size={40} strokeWidth={4} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAddExpense}
            className="bg-white p-8 border-4 border-slate-900 shadow-brutal-lg space-y-6"
          >
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 mb-4">
              Lançar Despesa Mensal
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="EX: ENERGIA ELÉTRICA"
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-900 rounded-none focus:bg-white outline-none text-sm font-bold placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor Total (R$)</label>
                  <input 
                    type="number" 
                    value={totalAmount} 
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-900 rounded-none focus:bg-white outline-none text-sm font-bold placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vencimento</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-900 rounded-none focus:bg-white outline-none text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Modalidade de Divisão</label>
                <div className="flex border-2 border-slate-900 p-1 bg-slate-900 gap-1 mt-1">
                  <button 
                    type="button"
                    onClick={() => setSplitEqually(false)}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                      !splitEqually ? "bg-white text-slate-900" : "text-slate-400 hover:text-slate-300"
                    )}
                  >
                    50 / 25 / 25
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSplitEqually(true)}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all",
                      splitEqually ? "bg-white text-slate-900" : "text-slate-400 hover:text-slate-300"
                    )}
                  >
                    IGUAL ({'~'}33% cada)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria (Opcional)</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="EX: CONTAS FIXAS"
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-900 rounded-none focus:bg-white outline-none text-sm font-bold placeholder:text-slate-300"
                />
              </div>
              
              <div className="flex items-center gap-3 bg-slate-100 p-4 border-2 border-slate-900">
                 <input 
                   type="checkbox" 
                   id="recurring" 
                   checked={isRecurring}
                   onChange={(e) => setIsRecurring(e.target.checked)}
                   className="w-5 h-5 accent-emerald-500 border-2 border-slate-900"
                 />
                 <label htmlFor="recurring" className="text-xs font-black uppercase tracking-tight text-slate-900 cursor-pointer">
                   CONTA FIXA (Renovar automaticamente todo mês)
                 </label>
              </div>
            </div>

            <button 
              type="submit"
              className="brutalist-button w-full mt-4"
            >
              Confirmar Registro
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <section className="space-y-6">
        <h3 className="font-black text-amber-500 uppercase tracking-tighter text-xl underline decoration-amber-500 decoration-4 underline-offset-4">Pagamentos Aguardando Aprovação</h3>

        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div 
              key={payment.id}
              className="bg-amber-50 p-5 border-4 border-slate-900 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{payment.user_name} pagou a parte dele:</p>
                <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight truncate leading-none mb-2">{payment.expense_description}</h4>
                <div className="flex items-center gap-3">
                   <span className="text-emerald-600 font-black text-lg leading-none">R$ {payment.amount_paid.toFixed(2)}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase border-l-2 border-slate-300 pl-3 flex items-center gap-1">
                     <Clock size={12} /> Data: {format(new Date(payment.date), "dd/MM", { locale: ptBR })}
                   </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleConfirm(payment.id)}
                className="bg-emerald-500 text-white px-6 py-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shrink-0 active:shadow-none active:translate-x-[1px] active:translate-y-[1px] font-black uppercase tracking-widest text-xs"
              >
                <CheckCircle2 size={16} strokeWidth={3} />
                Confirmar
              </button>
            </div>
          ))}

          {pendingPayments.length === 0 && (
            <div className="bg-slate-50 border-4 border-dashed border-slate-300 py-8 text-center space-y-4">
              <p className="text-slate-400 font-black uppercase text-sm tracking-widest">Nenhum pagamento pendente de aprovação.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-900 p-8 border-4 border-slate-900 shadow-brutal-lg text-white">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Métricas Gerais da Casa</h3>
          <DollarSign size={24} className="text-emerald-400" strokeWidth={3} />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Aberto</p>
            <p className="text-3xl font-black text-white whitespace-nowrap">R$ {totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="space-y-2 sm:text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Geral</p>
            <p className="text-3xl font-black text-white whitespace-nowrap">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
