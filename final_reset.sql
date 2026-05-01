-- 1. Garantir que as colunas novas existem na tabela
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS split_equally BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;

-- 2. Limpar todo o histórico de contas, pagamentos e avisos antigos (Mantém os usuários)
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.notices CASCADE;
TRUNCATE TABLE public.expenses CASCADE;

-- 3. Inserir as 3 contas oficiais com as flags corretas
DO $$ 
DECLARE
  admin_id UUID;
BEGIN
  -- Tentar pegar o ID do admin atual
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.expenses (description, total_amount, due_date, category, split_equally, is_recurring, created_by)
    VALUES 
      ('ALUGUEL', 2300.00, '2026-05-12', 'MORADIA', false, true, admin_id),
      ('CONDOMINIO', 400.00, '2026-05-12', 'MORADIA', false, true, admin_id),
      ('INTERNET', 150.00, '2026-05-25', 'SERVIÇOS', true, true, admin_id);
  END IF;
END $$;

-- 4. Garantir que a automação mensal (pg_cron) está ativada e atualizada
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

SELECT cron.schedule(
  'gerar_contas_mensais',
  '0 0 1 * *', 
  $$
    INSERT INTO public.expenses (description, total_amount, due_date, status, category, split_equally, is_recurring, created_by)
    SELECT 
      description, 
      total_amount, 
      CASE 
        WHEN description = 'INTERNET' THEN 
          (date_trunc('month', due_date + interval '1 month') + interval '11 days')::DATE
        ELSE 
          (due_date + interval '1 month')::DATE 
      END as due_date, 
      'pending' as status, 
      category, 
      split_equally, 
      true as is_recurring, 
      created_by
    FROM public.expenses
    WHERE is_recurring = true
    AND due_date >= date_trunc('month', current_date - interval '1 month')
    AND due_date < date_trunc('month', current_date);
  $$
);
