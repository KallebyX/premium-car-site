const { createClient } = require('@supabase/supabase-js');

let supabaseInstance = null;

function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
      console.warn('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
      // Return a mock object to prevent crashes during initialization
      return {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } }),
          insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          delete: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
        })
      };
    }

    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

// Export a proxy that lazily initializes the client
module.exports = new Proxy({}, {
  get(target, prop) {
    const client = getSupabase();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});