import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import {
  Gift,
  Mail,
  Frown,
  Plus,
  Send,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { GuestInteractionType } from "../types";

export default function GuestDashboard() {
  const { profile } = useAuth();
  const { guestInteractions, addGuestInteraction, deleteGuestInteraction } =
    useApp();

  const [activeTab, setActiveTab] = useState<GuestInteractionType>("request");
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && activeTab === "complaint") return;
    if (!title.trim() && activeTab !== "complaint") return;

    addGuestInteraction({
      type: activeTab,
      title: activeTab !== "complaint" ? title : undefined,
      duration: activeTab === "request" ? duration : undefined,
      content,
      status: "pending",
    });

    setTitle("");
    setDuration("");
    setContent("");
    setIsAdding(false);
  };

  const interactions = guestInteractions.filter((i) => i.type === activeTab);

  const tabs: { id: GuestInteractionType; label: string; icon: any }[] = [
    { id: "request", label: "Pedidos", icon: Gift },
    { id: "invite", label: "Convites", icon: Mail },
    { id: "complaint", label: "Reclamações", icon: Frown },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-2 p-1 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setIsAdding(false);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-3 border-4 border-slate-900 transition-all text-center",
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                : "bg-white text-slate-500 hover:bg-rose-50",
            )}
          >
            <tab.icon size={20} strokeWidth={3} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-tight w-full px-1 truncate">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
            {activeTab === "request"
              ? "Faça um pedido para a gostosa"
              : activeTab === "invite"
                ? "Convide para algo especial"
                : "Deixe sua reclamação aqui"}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-12 h-12 bg-rose-500 text-white border-4 border-slate-900 flex items-center justify-center shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)] space-y-4"
          >
            {activeTab !== "complaint" && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                  Título do {activeTab === "request" ? "Pedido" : "Convite"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    activeTab === "request"
                      ? "Ex: Massagem nos pés"
                      : "Ex: Jantar fora"
                  }
                  className="w-full px-4 py-3 bg-rose-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold"
                  required
                />
              </div>
            )}

            {activeTab === "request" && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                  Duração
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 15 minutos"
                  className="w-full px-4 py-3 bg-rose-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">
                Observações / Mensagem
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  activeTab === "complaint"
                    ? "Digite sua reclamação..."
                    : "Detalhes adicionais..."
                }
                className="w-full p-4 bg-rose-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold"
                rows={3}
                required={activeTab === "complaint"}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="brutalist-button bg-slate-900 text-white py-2 px-6 flex items-center gap-2"
              >
                <Send size={16} strokeWidth={3} />
                <span className="text-xs">Enviar</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {interactions.length === 0 ? (
          <div className="py-12 text-center border-4 border-dashed border-slate-200">
            <p className="text-slate-300 font-black uppercase tracking-widest">
              Nada por aqui ainda
            </p>
          </div>
        ) : (
          interactions.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 border-4 border-slate-900 relative"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="pr-12">
                  {item.title && (
                    <h3 className="font-black text-lg uppercase leading-tight text-slate-900">
                      {item.title}
                    </h3>
                  )}
                  {item.duration && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 mt-1">
                      <Clock size={10} strokeWidth={3} /> {item.duration}
                    </span>
                  )}
                </div>

                {activeTab !== 'complaint' && (
                  <div
                    className={cn(
                      "shrink-0 px-2 py-1 border-2 border-slate-900 text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                      item.status === "accepted"
                        ? "bg-emerald-400 text-slate-900"
                        : item.status === "rejected"
                          ? "bg-rose-500 text-white"
                          : "bg-amber-400 text-slate-900",
                    )}
                  >
                    {item.status === "accepted" && (
                      <CheckCircle2 size={10} strokeWidth={3} />
                    )}
                    {item.status === "rejected" && (
                      <XCircle size={10} strokeWidth={3} />
                    )}
                    {item.status === "accepted"
                      ? "Aceito"
                      : item.status === "rejected"
                        ? "Recusado"
                        : "Aguardando"}
                  </div>
                )}
                {activeTab === 'complaint' && item.status !== 'pending' && (
                  <div className="flex items-center gap-2">
                    {item.status.includes('|') && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {item.status.split('|')[1]}
                      </span>
                    )}
                    <div className="shrink-0 flex items-center justify-center bg-rose-50 border-2 border-slate-900 w-10 h-10 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" title="Reação do Admin">
                      <span className="text-2xl leading-none">{item.status.includes('|') ? item.status.split('|')[0] : item.status}</span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm font-bold text-slate-600 mt-2 bg-slate-50 p-2 border-2 border-slate-200">
                "{item.content}"
              </p>

              {(profile?.id === item.author_id ||
                profile?.role === "admin") && (
                <button
                  onClick={() => deleteGuestInteraction(item.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center hover:bg-rose-600 transition-colors"
                >
                  <Trash2 size={16} strokeWidth={3} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
