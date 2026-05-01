-- Limpa os registros de pagamentos, contas e avisos para começar do zero (mas mantém os usuários)
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.notices CASCADE;
TRUNCATE TABLE public.expenses CASCADE;

-- Inserir as contas iniciais
DO $$ 
DECLARE
  admin_id UUID;
BEGIN
  -- Tentar pegar o ID do admin atual (você)
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.expenses (description, total_amount, due_date, category, split_equally, created_by)
    VALUES 
      ('ALUGUEL', 2300.00, '2026-05-12', 'MORADIA', false, admin_id),
      ('CONDOMINIO', 400.00, '2026-05-12', 'MORADIA', false, admin_id),
      ('INTERNET', 150.00, '2026-05-25', 'SERVIÇOS', true, admin_id);
  END IF;
END $$;
