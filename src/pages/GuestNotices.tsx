import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, Plus, Trash2, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function GuestNotices() {
  const { profile } = useAuth();
  const { guestInteractions, addGuestInteraction, deleteGuestInteraction } =
    useApp();
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addGuestInteraction({
      type: "notice",
      content,
      status: "pending",
    });
    setContent("");
    setIsAdding(false);
  };

  const notices = guestInteractions.filter((i) => i.type === "notice");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none underline decoration-rose-400 decoration-8 underline-offset-4">
            Recadinhos
          </h2>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">
            Mural
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-14 h-14 bg-rose-500 text-white border-4 border-slate-900 flex items-center justify-center shadow-brutal active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
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
            className="bg-white p-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)] space-y-4 overflow-hidden"
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva algo especial..."
              className="w-full p-4 bg-rose-50 border-2 border-slate-900 rounded-none focus:outline-none focus:bg-white text-sm font-bold placeholder:text-rose-300"
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
                className="brutalist-button bg-rose-500 py-2 px-6 flex items-center gap-2"
              >
                <Send size={16} strokeWidth={3} />
                <span className="text-xs">Enviar</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {notices.length === 0 ? (
          <div className="py-20 text-center space-y-4 border-4 border-dashed border-rose-200">
            <MessageCircle size={48} className="text-rose-200 mx-auto" />
            <p className="text-rose-300 font-black uppercase tracking-widest">
              Nenhum recado ainda
            </p>
          </div>
        ) : (
          notices.map((notice, idx) => (
            <motion.div
              layout
              key={notice.id}
              initial={{ rotate: idx % 2 === 0 ? -1 : 1 }}
              className={cn(
                "p-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] relative transition-transform hover:rotate-0",
                notice.author_id === profile?.id ? "bg-rose-100" : "bg-white",
              )}
            >
              <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-900 pb-2">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {notice.author_id === profile?.id
                    ? "VOCÊ"
                    : notice.author_name?.toUpperCase() || "ADMIN"}
                </p>
                <span className="text-slate-900/20">•</span>
                <p className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">
                  {format(new Date(notice.created_at), "dd 'de' MMM", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <p className="text-slate-900 text-base leading-tight font-black uppercase tracking-tighter">
                "{notice.content}"
              </p>

              {(profile?.id === notice.author_id ||
                profile?.role === "admin") && (
                <button
                  onClick={() => deleteGuestInteraction(notice.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center hover:bg-rose-600 transition-colors"
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
