# 🏠 Casa em Dia

**Casa em Dia** é um aplicativo web completo projetado para facilitar a gestão financeira e a divisão de despesas entre moradores que compartilham uma residência (repúblicas, amigos, casais). Com uma interface ousada baseada nos princípios do **Brutalismo**, o sistema torna o processo de registrar, cobrar e acompanhar o pagamento das contas da casa mais intuitivo, justo e transparente.

---

## Interface e UX

O design do **Casa em Dia** foge dos padrões corporativos tradicionais e adota uma estética **Brutalista** (Neobrutalism). 
- Uso de sombras sólidas (hard shadows).
- Bordas espessas e contrastes altos.
- Fontes em peso *Black* e tipografia forte em uppercase.
- Paleta de cores vibrante, baseada em esmeralda, âmbar e azul profundo.

A experiência do usuário (UX) foi polida com transições suaves de animação (`motion/react`) para dar vida aos componentes sem perder a característica "raw" do estilo visual.

## Funcionalidades Principais

* **Gestão de Identidade e Autenticação:** Login e registro dinâmico. O sistema conta com perfis baseados em regras (Role-Based Access Control) onde existe um *Administrador da Casa* (responsável por lançar despesas e validar pagamentos) e os *Moradores*.
* **Mural de Despesas Mensais:** Listagem completa das contas da casa (Aluguel, Luz, Internet, etc). O sistema calcula automaticamente a cota-parte exata que cada morador deve pagar (divisão em proporções customizáveis, como 50/25/25 ou divisão igualitária).
* **Fluxo de Confirmação de Pagamentos:** Moradores podem "Marcar como Pago" a sua parte da conta. Esse pagamento vai para um mural de aprovação onde o Admin verifica e "Confirma" a baixa.
* **Automação de Baixa (Robô Fiscal):** Ao confirmar o pagamento de todos os membros e atingir 100% do valor de uma conta, o sistema automaticamente classifica a despesa como *Paga* e a retira das métricas de dívida ativa.
* **Dashboard Dinâmico:** Atualização em tempo real das dívidas de cada morador, contas a pagar, e alertas de proximidade de vencimento baseados na data de hoje.

---

## Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores ferramentas do ecossistema front-end moderno e Serverless:

* **React 18** com **Vite** (Ambiente de desenvolvimento ultrarrápido)
* **TypeScript** (Tipagem estática e segurança de código)
* **Tailwind CSS v3** (Estilização utilitária e componentes brutalistas)
* **Supabase** (Backend as a Service: Postgres Database, Authentication, Row Level Security)
* **Lucide React** (Ícones modernos)
* **Motion** (Animações fluidas de UI)
* **Date-fns** (Manipulação de datas)

---

## Como rodar o projeto localmente

Siga as instruções abaixo para executar o **Casa em Dia** no seu computador.

### Pré-requisitos
* [Node.js](https://nodejs.org/en/) (Versão 18 ou superior)
* Um projeto configurado no [Supabase](https://supabase.com/)

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/BabiDoo/coliving-finance-tracker.git
cd coliving-finance-tracker
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto e adicione as chaves do seu banco Supabase:
```env
VITE_SUPABASE_URL=https://sua-url-do-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

4. Criação de Usuários Iniciais (Admin e Moradores)
Como este aplicativo foi feito para uso pessoal específico, **não há uma tela pública de cadastro para evitar intrusos**. Quem for testar ou utilizar o clone precisará criar os usuários iniciais diretamente pelo painel do Supabase:

- Acesse **Authentication** > **Users** no Supabase e crie os usuários (ex: `admin@casa.com`, `morador1@casa.com`).
- Vá até o **SQL Editor** no Supabase e rode o seguinte comando para definir quem é o Admin (que terá permissões exclusivas de aprovação):

```sql
-- Defina o Admin
UPDATE public.users SET role = 'admin' WHERE email = 'admin@casa.com';

-- Defina os moradores
UPDATE public.users SET role = 'resident' WHERE email IN ('morador1@casa.com', 'morador2@casa.com');
```

> 💡 **Dica de Implementação para o Portfólio:** Sinta-se à vontade para fazer um *fork* deste projeto e implementar uma função no painel do Admin para "Adicionar Novo Morador" via interface! Essa é uma ótima melhoria que ainda não foi adicionada à versão base por ser um aplicativo de uso pessoal.

5. Execute o banco de dados inicial (Opcional)
Execute o arquivo `final_reset.sql` encontrado na raiz do projeto no SQL Editor do seu painel do Supabase para inicializar as contas mensais de exemplo (Aluguel, Condomínio) e ligá-las ao seu Admin recém-criado.

6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`.

*Deixe uma estrela ⭐️ se este projeto te inspirou ou ajudou de alguma forma!*
