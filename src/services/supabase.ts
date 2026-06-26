// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzdtupxyxzcudlmmflrf.supabase.co';
const supabaseAnonKey = 'sb_publishable_3bH9uijs5DgAm4d8GSOn1A_QqiUWXXd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin email — only this user can access the Admin Hub
export const ADMIN_EMAIL = 'caduogarcia@gmail.com';

// ────────────────────────────────────────────────────
// Helper Types
// ────────────────────────────────────────────────────
export interface UserDataRow {
  id: string;
  user_id: string;
  email: string;
  portfolio: any[];
  watchlist: string[];
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────────────
// Auth Helpers
// ────────────────────────────────────────────────────
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ────────────────────────────────────────────────────
// User Data CRUD (portfolio + watchlist)
// ────────────────────────────────────────────────────
export async function loadUserData(userId: string): Promise<UserDataRow | null> {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error loading user data:', error);
    return null;
  }
  return data;
}

export async function saveUserData(
  userId: string,
  email: string,
  portfolio: any[],
  watchlist: string[]
) {
  const { error } = await supabase
    .from('user_data')
    .upsert(
      {
        user_id: userId,
        email,
        portfolio,
        watchlist,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Error saving user data:', error);
  }
}

// ────────────────────────────────────────────────────
// Admin: Fetch ALL users' data (for the Admin Hub)
// ────────────────────────────────────────────────────
export async function fetchAllUsersData(): Promise<UserDataRow[]> {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all users data:', error);
    return [];
  }
  return data || [];
}
