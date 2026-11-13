# Calendário ICS da watchlist (passos do Gonçalo)

Cada conta pode subscrever, no Google Calendar, Apple Calendar ou Outlook, os eventos económicos das moedas dos ativos que segue. A ligação é privada (token secreto por conta).

## 1. Base de dados
No Supabase > SQL Editor, abre `supabase/migrations/0009_calendario_ics.sql`, copia o conteúdo e carrega em Run. (Se ainda não correste a `0008_perfil.sql`, corre-a primeiro.)

## 2. Edge Function
1. Supabase > Edge Functions > **Deploy a new function > Via Editor**, nome: `calendar-ics`.
2. Cola o conteúdo de `supabase/functions/calendar-ics/index.ts` e faz Deploy.
3. Nas definições da função, **desliga "Verify JWT"** (os programas de calendário não enviam sessão; quem protege é o token).
4. Não precisa de segredos novos: usa os mesmos `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` que o Supabase já dá às funções.

## 3. Testar
Entra no site > Conta > "Obter a minha ligação". Abre a ligação no browser: deve aparecer texto a começar por `BEGIN:VCALENDAR`. Para veres eventos, a watchlist tem de ter ativos cujas moedas tenham eventos nos próximos 120 dias.

## Notas
- Os programas de calendário atualizam sozinhos (o Google pode demorar horas).
- "Gerar nova ligação" invalida a anterior.
- Janela: de 7 dias atrás até 120 dias à frente.
