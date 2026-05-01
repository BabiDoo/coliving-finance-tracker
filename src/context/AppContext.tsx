import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, Notice, PaymentHistory, User, GuestInteraction } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  expenses: Expense[];
  notices: Notice[];
  history: PaymentHistory[];
  houseMembers: User[];
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateExpenseStatus: (id: string, status: Expense['status']) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addNotice: (content: string) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  registerPayment: (expenseId: string, amount: number) => Promise<void>;
  confirmPayment: (paymentId: string) => Promise<void>;
  guestInteractions: GuestInteraction[];
  addGuestInteraction: (data: Partial<GuestInteraction>) => Promise<void>;
  updateGuestInteractionStatus: (id: string, status: GuestInteraction['status']) => Promise<void>;
  deleteGuestInteraction: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [houseMembers, setHouseMembers] = useState<User[]>([]);
  const [guestInteractions, setGuestInteractions] = useState<GuestInteraction[]>([]);

  useEffect(() => {
    if (profile) {
      fetchData();
      
      // Setup Realtime subscriptions
      const expensesSub = supabase.channel('public:expenses')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, fetchData)
        .subscribe();
        
      const noticesSub = supabase.channel('public:notices')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchData)
        .subscribe();
        
      const paymentsSub = supabase.channel('public:payments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchData)
        .subscribe();
        
      const guestSub = supabase.channel('public:guest_interactions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_interactions' }, fetchData)
        .subscribe();

      return () => {
        supabase.removeChannel(expensesSub);
        supabase.removeChannel(noticesSub);
        supabase.removeChannel(paymentsSub);
        supabase.removeChannel(guestSub);
      };
    } else {
      setExpenses([]);
      setNotices([]);
      setHistory([]);
      setHouseMembers([]);
      setGuestInteractions([]);
    }
  }, [profile]);

  const fetchData = async () => {
    if (profile?.role === 'guest') {
      const [interactionsRes, usersRes] = await Promise.all([
        supabase.from('guest_interactions').select('*, users(name)').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('role', { ascending: true })
      ]);
      if (interactionsRes.data) {
        setGuestInteractions(interactionsRes.data.map(i => ({ ...i, author_name: i.users?.name })));
      }
      if (usersRes.data) setHouseMembers(usersRes.data);
      return;
    }

    const queries: any[] = [
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('notices').select('*, users(name)').order('created_at', { ascending: false }),
      supabase.from('payments').select('*, expenses(description), users(name)').order('date', { ascending: false }),
      supabase.from('users').select('*').order('role', { ascending: true })
    ];

    if (profile?.role === 'admin') {
      queries.push(supabase.from('guest_interactions').select('*, users(name)').order('created_at', { ascending: false }));
    }

    const results = await Promise.all(queries);
    const [expensesRes, noticesRes, historyRes, usersRes, interactionsRes] = results;

    if (expensesRes.data) setExpenses(expensesRes.data);
    if (noticesRes.data) setNotices(noticesRes.data.map(n => ({ ...n, author_name: n.users?.name })));
    if (historyRes.data) setHistory(historyRes.data.map(h => ({ ...h, expense_description: h.expenses?.description, user_name: h.users?.name })));
    if (usersRes.data) setHouseMembers(usersRes.data);
    if (interactionsRes?.data) setGuestInteractions(interactionsRes.data.map((i: any) => ({ ...i, author_name: i.users?.name })));
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at' | 'created_by'>) => {
    if (!profile) return;
    await supabase.from('expenses').insert([{
      ...expenseData,
      created_by: profile.id
    }]);
  };

  const updateExpenseStatus = async (id: string, status: Expense['status']) => {
    // Atualização otimista
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    
    await supabase.from('expenses').update({ status }).eq('id', id);
  };

  const deleteExpense = async (id: string) => {
    if (profile?.role !== 'admin') return;
    
    // Atualização otimista na interface para ser instantâneo
    setExpenses(prev => prev.filter(e => e.id !== id));
    
    await supabase.from('expenses').delete().eq('id', id);
  };

  const addNotice = async (content: string) => {
    if (!profile) return;

    // Atualização otimista
    const tempNotice = {
      id: `temp-${Date.now()}`,
      content,
      author_id: profile.id,
      created_at: new Date().toISOString(),
      author_name: profile.name || 'Você'
    };
    
    setNotices(prev => [tempNotice as any, ...prev]);

    await supabase.from('notices').insert([{
      content,
      author_id: profile.id
    }]);
  };

  const deleteNotice = async (id: string) => {
    // Atualização otimista
    setNotices(prev => prev.filter(n => n.id !== id));
    await supabase.from('notices').delete().eq('id', id);
  };

  const checkExpenseFullyPaid = async (expenseId: string) => {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('expense_id', expenseId)
      .eq('status', 'confirmed');
      
    if (payments) {
      const { data: exp } = await supabase.from('expenses').select('total_amount').eq('id', expenseId).single();
      if (exp) {
        const sum = payments.reduce((acc, p) => acc + Number(p.amount_paid), 0);
        if (sum >= exp.total_amount - 0.05) {
          setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'paid' } : e));
          await supabase.from('expenses').update({ status: 'paid' }).eq('id', expenseId);
        }
      }
    }
  };

  const registerPayment = async (expenseId: string, amount: number) => {
    if (!profile) return;

    const isAutoConfirmed = profile.role === 'admin';
    const initialStatus = isAutoConfirmed ? 'confirmed' : 'pending';

    const optimisticPayment: PaymentHistory = {
      id: `temp-${Date.now()}`,
      expense_id: expenseId,
      user_id: profile.id,
      amount_paid: amount,
      status: initialStatus,
      date: new Date().toISOString(),
      expense_description: expenses.find(e => e.id === expenseId)?.description || '',
      user_name: profile.name || ''
    };
    
    setHistory(prev => [optimisticPayment, ...prev]);

    await supabase.from('payments').insert([{
      expense_id: expenseId,
      user_id: profile.id,
      amount_paid: amount,
      status: initialStatus
    }]);

    if (isAutoConfirmed) {
      await checkExpenseFullyPaid(expenseId);
    }
  };

  const confirmPayment = async (paymentId: string) => {
    if (profile?.role !== 'admin') return;
    
    // Atualização otimista
    setHistory(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'confirmed' } : p));

    await supabase.from('payments').update({ status: 'confirmed' }).eq('id', paymentId);
    
    const payment = history.find(p => p.id === paymentId);
    if (payment) {
      await checkExpenseFullyPaid(payment.expense_id);
    }
  };

  const addGuestInteraction = async (data: Partial<GuestInteraction>) => {
    if (!profile) return;
    
    const temp: any = {
      id: `temp-${Date.now()}`,
      ...data,
      status: data.status || 'pending',
      author_id: profile.id,
      created_at: new Date().toISOString(),
      author_name: profile.name || 'Você'
    };
    
    setGuestInteractions(prev => [temp, ...prev]);

    await supabase.from('guest_interactions').insert([{
      ...data,
      author_id: profile.id
    }]);
  };

  const updateGuestInteractionStatus = async (id: string, status: GuestInteraction['status']) => {
    setGuestInteractions(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    await supabase.from('guest_interactions').update({ status }).eq('id', id);
  };

  const deleteGuestInteraction = async (id: string) => {
    setGuestInteractions(prev => prev.filter(i => i.id !== id));
    await supabase.from('guest_interactions').delete().eq('id', id);
  };

  return (
    <AppContext.Provider value={{ 
      expenses, notices, history, houseMembers, guestInteractions,
      addExpense, updateExpenseStatus, deleteExpense,
      addNotice, deleteNotice, registerPayment, confirmPayment,
      addGuestInteraction, updateGuestInteractionStatus, deleteGuestInteraction
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
