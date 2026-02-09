
# Plano: Ativar Lovable Cloud com Autenticacao, Banco de Dados e Stripe

Este e um projeto grande que precisa ser feito em etapas. Vou detalhar cada fase abaixo.

---

## Fase 1: Ativar Lovable Cloud e Configurar Banco de Dados

### 1.1 Ativar Lovable Cloud
- Habilitar Lovable Cloud no projeto (necessario antes de qualquer codigo backend)

### 1.2 Criar Tabelas no Banco de Dados

**Tabelas necessarias:**

- **stalls** - Barracas digitais por cidade
  - `id`, `city_name`, `state_abbr`, `stall_number` (1-40), `owner_id` (FK auth.users), `owner_name`, `is_vip`, `plan_id`, `secret_code`, `created_at`

- **products** - Produtos de cada barraca
  - `id`, `stall_id` (FK stalls), `name`, `description`, `price`, `image_url`, `sort_order`

- **carousel_ads** - Propagandas do carrossel por cidade
  - `id`, `city_name`, `state_abbr`, `title`, `subtitle`, `image_url`, `merchant_id`, `active`, `sort_order`

- **promotions** - Promocoes por cidade
  - `id`, `city_name`, `state_abbr`, `store_name`, `deal`, `discount`, `expires`, `image_url`

- **events** - Eventos por cidade
  - `id`, `city_name`, `state_abbr`, `name`, `date`, `time`, `location`, `image_url`

- **user_roles** - Tabela de roles (admin, merchant, user)
  - `id`, `user_id` (FK auth.users), `role` (enum: admin, merchant, user)

### 1.3 Configurar RLS (Row Level Security)
- Usuarios comuns podem ler barracas, produtos, eventos, promocoes e carrossel
- Comerciantes podem editar apenas suas proprias barracas e produtos
- Admin pode editar tudo (usando funcao `has_role` com SECURITY DEFINER)
- Funcao helper `has_role(user_id, role)` para evitar recursao de RLS

---

## Fase 2: Autenticacao com Google

### 2.1 Configurar Google OAuth
- Ativar provedor Google no Lovable Cloud (Auth settings)
- Substituir o botao fake de Google login por `supabase.auth.signInWithOAuth({ provider: 'google' })`

### 2.2 Criar Context de Autenticacao
- Novo `AuthContext` com `onAuthStateChange` + `getSession`
- Proteger rotas de admin e comerciante com verificacao de role via banco
- Remover credenciais hardcoded do MerchantPanel (EERB1976/EERB197666)

### 2.3 Fluxo do Usuario
- Landing page: seleciona estado/cidade, confirma que e humano, clica "Entrar com Google"
- Google OAuth redireciona de volta para `/city/{state}/{city}`
- Admin e comerciante sao verificados via tabela `user_roles` no banco

---

## Fase 3: Integrar Stripe para Pagamento dos Planos

### 3.1 Habilitar Stripe
- Usar a integracao nativa do Lovable com Stripe
- Criar produtos e precos no Stripe para os 4 planos (Basico R$10, Carrossel R$20, Combo R$30, VIP R$59.99)
- Configurar precos mensais e anuais com descontos

### 3.2 Fluxo de Pagamento
- Na pagina de Planos, substituir botao "Contratar via WhatsApp" por checkout Stripe
- Apos pagamento, criar registro na tabela `stalls` com o plano adquirido
- Gerar codigo secreto automaticamente e enviar ao comerciante
- Edge function para webhook do Stripe processar pagamentos confirmados

### 3.3 Gerenciamento de Assinatura
- Comerciante pode ver status da assinatura no painel
- Cancelamento e renovacao via portal do Stripe

---

## Fase 4: Migrar Dados Estaticos para o Banco

### 4.1 Substituir dados hardcoded
- `stallsData` de `cities.ts` passa a vir do Supabase
- Carrossel, promocoes e eventos passam a ser dinamicos
- Admin panel passa a fazer CRUD real no banco

### 4.2 Manter dados estaticos como fallback
- Cidades e estados continuam estaticos (nao mudam)
- Dados de clima e historia continuam gerados localmente

---

## Resumo da Ordem de Execucao

| Etapa | Acao | Depende de |
|-------|------|------------|
| 1 | Ativar Lovable Cloud | - |
| 2 | Criar schema do banco (tabelas + RLS) | Etapa 1 |
| 3 | Configurar Google OAuth | Etapa 1 |
| 4 | Criar AuthContext e proteger rotas | Etapas 2-3 |
| 5 | Habilitar Stripe | Etapa 1 |
| 6 | Criar produtos/precos no Stripe | Etapa 5 |
| 7 | Integrar checkout na pagina de Planos | Etapa 6 |
| 8 | Migrar dados para o banco | Etapa 2 |
| 9 | Admin panel com CRUD real | Etapas 4, 8 |

---

## Secao Tecnica

**Arquitetura de seguranca:**
- Roles em tabela separada (`user_roles`), nunca no perfil
- Funcao `has_role()` com `SECURITY DEFINER` para evitar recursao RLS
- Admin verificado server-side, nunca por credenciais client-side
- Stripe webhooks validados via edge function com secret

**Edge Functions necessarias:**
- `stripe-webhook` - Processar pagamentos confirmados
- `create-checkout` - Criar sessao de checkout Stripe

**Nota importante:** Este plano e extenso. Recomendo aprovar e implementar em etapas, comecando pela ativacao do Lovable Cloud e criacao do banco de dados.
