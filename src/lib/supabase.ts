import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Só chaves públicas aqui. A chave secreta (service role) nunca entra na app.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Devolve o cliente, ou null se não houver configuração (a app usa dados locais). */
export function getSupabase(): SupabaseClient | null {
  // No servidor (geração estática) não há sessão nem armazenamento: não cria cliente.
  if (!isSupabaseConfigured || typeof window === 'undefined') return null;
  if (!client) {
    client = createClient(url as string, key as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Na web a ligação mágica e o Google voltam com a sessão no endereço.
        detectSessionInUrl: typeof document !== 'undefined',
      },
    });
  }
  return client;
}
