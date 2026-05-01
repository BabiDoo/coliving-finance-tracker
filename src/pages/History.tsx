import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History as HistoryIcon, Search, Filter } from 'lucide-react';

export default function History() {
  const { profile } = useAuth();
  const { history } = useApp();

  if (!profile) return null;

  const filteredHistory = profile.role === 'admin' 
    ? history 
    : history.filter(h => h.user_id === profile.id);

  return (
    <div className="space-y-8">
      <div className="px-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-emerald-500 decoration-8 underline-offset-4">Histórico</h2>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">Registro de Pagamentos</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] px-4 py-3 flex items-center gap-2">
          <Search size={16} className="text-slate-900" strokeWidth={3} />
          <input 
            type="text" 
            placeholder="BUSCAR..." 
            className="bg-transparent border-none outline-none text-[10px] w-full font-black uppercase tracking-widest" 
          />
        </div>
        <button className="bg-white p-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-slate-900 active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
          <Filter size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="py-20 text-center space-y-4 border-4 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
              <HistoryIcon size={32} />
            </div>
            <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Nenhum registro encontrado</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-5 border-4 border-slate-900 shadow-brutal flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-emerald-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center shrink-0">
                <span className="font-black text-xs uppercase">PAY</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight truncate leading-none">{item.expense_description}</h3>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 border border-blue-200">
                    {item.user_name}
                  </span>
                  <span>•</span>
                  <span>{format(new Date(item.date), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-xl text-slate-900 tracking-tighter leading-none mb-1">R$ {item.amount_paid.toFixed(2)}</p>
                {item.status === 'confirmed' ? (
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1 border border-emerald-200 inline-block">CONFIRMADO</p>
                ) : (
                  <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1 border border-amber-200 inline-block">PENDENTE</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
