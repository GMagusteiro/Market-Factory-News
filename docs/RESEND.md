# Emails de início de sessão com Resend (passos do Gonçalo)

O servidor de email de origem do Supabase tem um limite muito baixo de envios por hora. Para produção, usar SMTP próprio com o Resend (plano grátis: 3000 emails/mês, 100/dia).

1. Criar conta em resend.com (grátis).
2. **Sem domínio próprio** só se pode enviar para o teu próprio email (modo de testes). Para enviar a qualquer pessoa é preciso um domínio: Resend → Domains → Add Domain → copiar os registos DNS (SPF/DKIM) para o fornecedor do domínio. Um domínio custa ~10 €/ano. Até lá, o login funciona só para ti.
3. Resend → API Keys → Create (permissão de envio). Copiar a chave (começa por `re_`). **Nunca a coles no código nem no chat com terceiros.**
4. Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP:
   - Host `smtp.resend.com`, porta `465`
   - Username `resend`
   - Password: a chave `re_...`
   - Sender email: um endereço do teu domínio verificado (ex.: `login@teudominio.pt`); Sender name: `Market Factory News`
5. Authentication → Rate Limits: subir o limite de emails por hora (ex.: 30).
6. Testar: pedir uma ligação em /conta com um email que não seja o teu.

Pendente: domínio próprio (Fase 4).
