import { UserProfile, Expense } from '../types';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações desktop');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body
    });
  }
};

export const checkUpcomingExpenses = (expenses: Expense[], profile: UserProfile) => {
  const lastNotificationStr = localStorage.getItem('lastNotificationDate');
  const todayStr = new Date().toDateString();

  if (lastNotificationStr === todayStr) {
    return; // Já notificou hoje
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Início do dia

  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999); // Final do 7º dia

  let notifiedCount = 0;

  expenses.forEach(expense => {
    if (expense.status === 'paid') return;

    // Converte a string YYYY-MM-DD considerando a timezone local corretamente
    const [year, month, day] = expense.due_date.split('T')[0].split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);

    const isDueSoon = dueDate >= today && dueDate <= nextWeek;

    // Todos são responsáveis por todas as contas no sistema atual (50/25/25)
    if (isDueSoon) {
      sendNotification(
        'Vencimento Próximo!',
        `A conta "${expense.description}" vence dia ${dueDate.toLocaleDateString('pt-BR')}.`
      );
      notifiedCount++;
    }
  });

  // Salva no storage que já avisou hoje, se encontrou alguma conta
  if (notifiedCount > 0) {
    localStorage.setItem('lastNotificationDate', todayStr);
  }
};
