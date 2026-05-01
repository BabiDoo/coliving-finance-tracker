import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, Notice, PaymentHistory } from '../types';
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [houseMembers, setHouseMembers] = useState<User[]>([]);

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

      return () => {
        supabase.removeChannel(expensesSub);
        supabase.removeChannel(noticesSub);
        supabase.removeChannel(paymentsSub);
      };
    } else {
      setExpenses([]);
      setNotices([]);
      setHistory([]);
      setHouseMembers([]);
    }
  }, [profile]);

  const fetchData = async () => {
    const [expensesRes, noticesRes, historyRes, usersRes] = await Promise.all([
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      supabase.from('notices').select('*, users(name)').order('created_at', { ascending: false }),
      supabase.from('payments').select('*, expenses(description), users(name)').order('date', { ascending: false }),
      supabase.from('users').select('*').order('role', { ascending: true })
    ]);

    if (expensesRes.data) setExpenses(expensesRes.data);
    
    if (noticesRes.data) {
      setNotices(noticesRes.data.map(n => ({
        ...n,
        author_name: n.users?.name
      })));
    }
    
    if (historyRes.data) {
      setHistory(historyRes.data.map(h => ({
        ...h,
        expense_description: h.expenses?.description,
        user_name: h.users?.name
      })));
    }

    if (usersRes.data) {
      setHouseMembers(usersRes.data);
    }
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
    await supabase.from('notices').insert([{
      content,
      author_id: profile.id
    }]);
  };

  const deleteNotice = async (id: string) => {
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

  return (
    <AppContext.Provider value={{ 
      expenses, notices, history, houseMembers,
      addExpense, updateExpenseStatus, deleteExpense,
      addNotice, deleteNotice, registerPayment, confirmPayment 
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
