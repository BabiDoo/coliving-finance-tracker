import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wallet, Calendar, AlertCircle, ArrowUpRight } from 'lucide-react';
import { checkUpcomingExpenses, requestNotificationPermission } from '../lib/notifications';

export default function Dashboard() {
  const { profile } = useAuth();
  const { expenses, history } = useApp();

  useEffect(() => {
    if (profile && expenses.length > 0) {
      requestNotificationPermission().then(granted => {
        if (granted) {
          const userPayments = new Set(
            history
              .filter(h => h.user_id === profile.id)
              .map(h => h.expense_id)
          );
          const relevantExpenses = expenses.filter(e => !userPayments.has(e.id));
          checkUpcomingExpenses(relevantExpenses, profile);
        }
      });
    }
  }, [profile, expenses]);

  if (!profile) return null;

  // Descobrir quais contas o usuário atual já pagou (mesmo que aguardando confirmação)
  const userPayments = new Set(
    history
      .filter(h => h.user_id === profile.id)
      .map(h => h.expense_id)
  );

  const userTotalPaid = history
    .filter(h => h.user_id === profile.id && h.status === 'confirmed')
    .reduce((sum, h) => sum + h.amount_paid, 0);

  const totalPaidHouse = history
    .filter(h => h.status === 'confirmed')
    .reduce((sum, h) => sum + h.amount_paid, 0);

  const groupExpenses = expenses.map(e => {
    let amountDue = 0;
    if (e.split_equally) {
      amountDue = e.total_amount / 3;
    } else {
      amountDue = profile.role === 'admin' ? e.total_amount * 0.5 : e.total_amount * 0.25;
    }
    return { ...e, amountDue };
  });

  // Só é pendente se a conta não está 'paid' GERAL E o usuário não pagou a parte dele (pendente ou confirmado)
  const pendingExpenses = groupExpenses.filter(e => e.status !== 'paid' && e.amountDue > 0 && !userPayments.has(e.id));
  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amountDue, 0);

  const nextDueList = pendingExpenses.length > 0 
    ? [...pendingExpenses].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 2)
    : [];

  return (
    <div className="space-y-8">
      <section className="bg-white p-8 border-4 border-slate-900 shadow-brutal-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Total Pendente ({profile.role === 'admin' ? 'Sua Parte - 50%' : 'Sua Parte - 25%'})
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">R$</span>
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
              {Math.floor(totalPending).toLocaleString('pt-BR')}
              <span className="text-2xl opacity-40">,{(totalPending % 1).toFixed(2).split('.')[1]}</span>
            </h2>
          </div>
          <div className="mt-6 flex gap-2">
            <span className="bg-emerald-500 text-white px-3 py-1 font-black text-[10px] uppercase border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              {expenses.filter(e => e.status !== 'paid').length} Contas ativas
            </span>
          </div>
        </div>
        <Wallet className="absolute -bottom-4 -right-4 text-slate-50 w-32 h-32 -rotate-12" />
      </section>

      {nextDueList.length > 0 && (
        <section className="bg-amber-100 p-6 border-4 border-slate-900 shadow-brutal">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-4">Próximos Vencimentos</p>
          <div className="flex flex-col gap-4">
            {nextDueList.map(due => (
              <div key={due.id} className="flex items-center gap-4 border-b-2 border-slate-900/10 pb-4 last:border-0 last:pb-0">
                <div className="w-10 h-10 bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle size={20} strokeWidth={3} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-black text-lg text-slate-900 truncate leading-tight">{due.description.toUpperCase()}</h3>
                  <p className="text-[10px] text-amber-700 font-black mt-0.5 uppercase tracking-wider">
                    {format(new Date(due.due_date), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="font-black text-slate-900 uppercase tracking-tighter text-xl underline decoration-slate-900 decoration-4 underline-offset-4 mb-6">Status da Casa</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 border-4 border-slate-900 shadow-brutal flex flex-col gap-4">
            <div className="w-10 h-10 bg-emerald-100 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center text-emerald-700">
              <Calendar size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pago</p>
              <p className="text-2xl font-black text-slate-900 leading-none">R$ {Math.floor(totalPaidHouse).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <div className="bg-white p-6 border-4 border-slate-900 shadow-brutal flex flex-col gap-4">
            <div className="w-10 h-10 bg-blue-100 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center text-blue-700">
              <ArrowUpRight size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Geral</p>
              <p className="text-2xl font-black text-slate-900 leading-none">R$ {Math.floor(expenses.reduce((sum, e) => sum + e.total_amount, 0)).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
