const { createClient } = require('@supabase/supabase-js');

let supabaseInstance = null;

// Create a chainable mock query builder for when Supabase is not configured
function createMockQueryBuilder() {
  const mockResult = { data: [], error: null, count: 0 };

  const chainable = {
    select: () => chainable,
    insert: () => chainable,
    update: () => chainable,
    delete: () => chainable,
    eq: () => chainable,
    neq: () => chainable,
    gt: () => chainable,
    gte: () => chainable,
    lt: () => chainable,
    lte: () => chainable,
    like: () => chainable,
    ilike: () => chainable,
    is: () => chainable,
    in: () => chainable,
    or: () => chainable,
    and: () => chainable,
    not: () => chainable,
    order: () => chainable,
    range: () => chainable,
    limit: () => chainable,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve) => resolve(mockResult),
    catch: () => chainable
  };

  return chainable;
}

function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
      console.warn('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
      // Return a mock object that supports chaining to prevent crashes
      return {
        from: () => createMockQueryBuilder()
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