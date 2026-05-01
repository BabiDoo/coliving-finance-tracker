export type UserRole = 'admin' | 'resident' | 'guest';
export type UserGroup = 'individual' | 'couple';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  group: UserGroup;
}

export type GuestInteractionType = 'notice' | 'request' | 'complaint' | 'invite';
export type GuestInteractionStatus = 'pending' | 'accepted' | 'rejected' | string;

export interface GuestInteraction {
  id: string;
  type: GuestInteractionType;
  title?: string;
  duration?: string;
  content: string;
  status: GuestInteractionStatus;
  author_id: string;
  created_at: string;
  author_name?: string;
}

export type ExpenseStatus = 'pending' | 'paid' | 'overdue';

export interface Expense {
  id: string;
  description: string;
  total_amount: number;
  due_date: string;
  status: ExpenseStatus;
  category: string;
  split_equally: boolean;
  is_recurring: boolean;
  created_at: string;
  created_by: string;
}

export interface Notice {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author_name?: string; // We can join this on the frontend
}

export interface PaymentHistory {
  id: string;
  expense_id: string;
  user_id: string;
  amount_paid: number;
  status: 'pending' | 'confirmed';
  date: string;
  
  // Joined fields for convenience
  expense_description?: string;
  user_name?: string;
}
