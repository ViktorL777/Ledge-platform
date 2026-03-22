import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const db = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('kv_store')
        .select('value')
        .eq('key', key)
        .single();
      if (error || !data) return null;
      return data.value;
    } catch (e) {
      return null;
    }
  },

  async set(key, value) {
    try {
      const { error } = await supabase
        .from('kv_store')
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      return !error;
    } catch (e) {
      return false;
    }
  },

  async del(key) {
    try {
      const { error } = await supabase
        .from('kv_store')
        .delete()
        .eq('key', key);
      return !error;
    } catch (e) {
      return false;
    }
  },

  async list(prefix) {
    try {
      const { data, error } = await supabase
        .from('kv_store')
        .select('key')
        .like('key', `${prefix}%`);
      if (error || !data) return [];
      return data.map(d => d.key);
    } catch (e) {
      return [];
    }
  },
};

export { supabase, db };
