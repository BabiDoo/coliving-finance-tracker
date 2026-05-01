import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  LogOut,
  Heart,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/", label: "Painel", icon: LayoutDashboard },
  { path: "/notices", label: "Mural", icon: MessageCircle },
];

export default function GuestLayout() {
  const { profile, signOut } = useAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-rose-50 text-slate-900 font-sans">
      {isOffline && (
        <div className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest text-center py-1 flex items-center justify-center gap-2 sticky top-0 z-50">
          Você está Offline - Modo de Leitura{" "}
          <WifiOff size={12} strokeWidth={3} />
        </div>
      )}
      <header className="sticky top-0 z-30 bg-white border-b-4 border-slate-900 px-4 py-4 flex items-center justify-between shadow-[0_4px_0_0_rgba(15,23,42,1)]">
        <div className="flex items-center gap-2">
          <Heart
            className="text-rose-500 fill-rose-500"
            size={24}
            strokeWidth={3}
          />
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none uppercase">
              Espaço Secreto
            </h1>
            <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1.5">
              Área do love love
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "h-9 w-9 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-colors active:shadow-none active:translate-x-[1px] active:translate-y-[1px]",
                isActive ? "bg-rose-300" : "bg-rose-100 hover:bg-rose-200",
              )
            }
            title="Meu Perfil"
          >
            <span className="text-rose-800 font-black uppercase text-sm">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </span>
          </NavLink>
          <button
            onClick={() => signOut()}
            className="p-2 bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] text-slate-900 hover:bg-rose-50 transition-colors active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            title="Sair"
          >
            <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-32 p-4 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, type: "spring", damping: 20 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <nav className="fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-white border-4 border-slate-900 shadow-brutal flex items-center justify-center gap-8 py-3 px-6 max-w-sm mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 transition-all px-4 py-2",
                  isActive
                    ? "text-slate-900 bg-rose-100 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                    : "text-slate-400 opacity-80 hover:text-rose-500",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={24} strokeWidth={isActive ? 3 : 2} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
