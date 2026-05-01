import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Gift, Mail, Frown, MessageCircle, CheckCircle2, XCircle, Clock, Trash2, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GuestInteractionType } from '../types';

export default function AdminGuestArea() {
  const { guestInteractions, updateGuestInteractionStatus, deleteGuestInteraction, addGuestInteraction } = useApp();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<GuestInteractionType>('request');
  const [replyContent, setReplyContent] = useState('');

  const interactions = guestInteractions.filter(i => i.type === activeTab);

  const handleReplyNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    addGuestInteraction({
      type: 'notice',
      content: replyContent,
      status: 'pending' // Notices don't really use status, but required by type
    });
    setReplyContent('');
  };

  const tabs: { id: GuestInteractionType, label: string, icon: any }[] = [
    { id: 'request', label: 'Pedidos', icon: Gift },
    { id: 'invite', label: 'Convites', icon: Mail },
    { id: 'complaint', label: 'Reclamações', icon: Frown },
    { id: 'notice', label: 'Mural', icon: MessageCircle },
  ];

  return (
    <div className="space-y-8">
      <div className="px-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-rose-400 decoration-8 underline-offset-4">Área do Agregado</h2>
        <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">Gerencie as interações do seu +1</p>
      </div>

      <div className="grid grid-cols-4 gap-2 p-1 w-full">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 border-4 border-slate-900 transition-all text-center",
              activeTab === tab.id ? "bg-rose-500 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" : "bg-white text-slate-500 hover:bg-rose-50"
            )}
          >
            <tab.icon size={18} strokeWidth={3} />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-tight w-full px-0.5 truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'notice' && (
        <form onSubmit={handleReplyNotice} className="bg-white p-4 border-4 border-slate-900 flex flex-col gap-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Responder no mural..."
            className="w-full p-3 bg-rose-50 border-2 border-slate-900 focus:outline-none text-sm font-bold"
            rows={2}
            required
          />
          <button type="submit" className="brutalist-button bg-slate-900 text-white py-2 px-6 self-end flex items-center gap-2">
            <Send size={16} /> <span className="text-xs">Enviar Recado</span>
          </button>
        </form>
      )}

      <div className="space-y-4">
        {interactions.length === 0 ? (
          <div className="py-12 text-center border-4 border-dashed border-slate-200">
            <p className="text-slate-300 font-black uppercase tracking-widest">Nenhuma interação aqui</p>
          </div>
        ) : (
          interactions.map((item) => (
            <div key={item.id} className="bg-white p-4 border-4 border-slate-900 relative">
              <div className="flex justify-between items-start mb-2">
                <div className="pr-12">
                  {item.title && <h3 className="font-black text-lg uppercase leading-tight text-slate-900">{item.title}</h3>}
                  {item.duration && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 mt-1">
                      <Clock size={10} strokeWidth={3} /> {item.duration}
                    </span>
                  )}
                  {activeTab === 'notice' && (
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {item.author_name} • {format(new Date(item.created_at), "dd 'de' MMM", { locale: ptBR })}
                    </p>
                  )}
                </div>
                
                {activeTab !== 'notice' && activeTab !== 'complaint' && (
                  <div className={cn(
                    "shrink-0 px-2 py-1 border-2 border-slate-900 text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                    item.status === 'accepted' ? 'bg-emerald-400 text-slate-900' :
                    item.status === 'rejected' ? 'bg-rose-500 text-white' :
                    'bg-amber-400 text-slate-900'
                  )}>
                    {item.status === 'accepted' ? 'Aceito' : item.status === 'rejected' ? 'Recusado' : 'Aguardando'}
                  </div>
                )}
                {activeTab === 'complaint' && item.status !== 'pending' && (
                  <div className="flex items-center gap-2">
                    {item.status.includes('|') && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {item.status.split('|')[1]}
                      </span>
                    )}
                    <div className="shrink-0 flex items-center justify-center bg-rose-50 border-2 border-slate-900 w-10 h-10 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" title="Sua reação">
                      <span className="text-2xl leading-none">{item.status.includes('|') ? item.status.split('|')[0] : item.status}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-sm font-bold text-slate-600 mt-2 bg-slate-50 p-3 border-2 border-slate-200">
                "{item.content}"
              </p>

              {(activeTab === 'request' || activeTab === 'invite') && item.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => updateGuestInteractionStatus(item.id, 'accepted')}
                    className="flex-1 bg-emerald-400 text-slate-900 border-2 border-slate-900 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 flex justify-center items-center gap-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all"
                  >
                    <CheckCircle2 size={14} strokeWidth={3} /> Aceitar
                  </button>
                  <button 
                    onClick={() => updateGuestInteractionStatus(item.id, 'rejected')}
                    className="flex-1 bg-rose-400 text-white border-2 border-slate-900 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 flex justify-center items-center gap-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all"
                  >
                    <XCircle size={14} strokeWidth={3} /> Recusar
                  </button>
                </div>
              )}

              {activeTab === 'complaint' && (
                <div className="mt-4 flex gap-2">
                  {['😂', '🙄', '🥺', '❤️', '🤬'].map(emoji => {
                    const currentEmoji = item.status.includes('|') ? item.status.split('|')[0] : item.status;
                    return (
                      <button 
                        key={emoji}
                        onClick={() => updateGuestInteractionStatus(item.id, `${emoji}|${profile?.name || 'Admin'}`)}
                        className={cn(
                          "flex-1 border-2 border-slate-900 py-1 text-xl flex justify-center items-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all",
                          currentEmoji === emoji ? "bg-rose-200" : "bg-white hover:bg-rose-50"
                        )}
                        title={`Reagir com ${emoji}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              )}

              <button 
                onClick={() => deleteGuestInteraction(item.id)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center hover:bg-rose-600 transition-colors"
              >
                <Trash2 size={16} strokeWidth={3} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
