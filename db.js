'use strict';
// IndexedDB layer. To change the schema later: bump VERSION and add a step in
// onupgradeneeded that only ADDS stores/indexes (never clears existing data).
const DB = (() => {
  const VERSION = 1, NAME = 'nirob-lifeos';
  const STORES = ['salaries', 'ot', 'tx', 'cats', 'goals', 'deps'];
  let db;
  const open = () => new Promise((res, rej) => {
    const r = indexedDB.open(NAME, VERSION);
    r.onupgradeneeded = () => {
      const d = r.result;
      STORES.forEach(s => {
        if (!d.objectStoreNames.contains(s))
          d.createObjectStore(s, s === 'salaries' ? { keyPath: 'month' } : { keyPath: 'id', autoIncrement: true });
      });
    };
    r.onsuccess = () => { db = r.result; res(); };
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('Database blocked by another tab'));
  });
  const run = (s, mode, f) => new Promise((res, rej) => {
    const t = db.transaction(s, mode), q = f(t.objectStore(s));
    t.oncomplete = () => res(q && q.result);
    t.onerror = t.onabort = () => rej(t.error || new Error('Transaction failed'));
  });
  return {
    STORES, open,
    all: s => run(s, 'readonly', o => o.getAll()),
    put: (s, v) => run(s, 'readwrite', o => o.put(v)),
    del: (s, k) => run(s, 'readwrite', o => o.delete(k)),
    async dump() {
      const o = { app: 'nirob-lifeos', version: VERSION, exportedAt: new Date().toISOString() };
      for (const s of STORES) o[s] = await this.all(s);
      return o;
    },
    // Single transaction: if anything fails, it aborts and old data stays untouched.
    restore(o) {
      return new Promise((res, rej) => {
        const t = db.transaction(STORES, 'readwrite');
        STORES.forEach(s => { const st = t.objectStore(s); st.clear(); o[s].forEach(v => st.put(v)); });
        t.oncomplete = res;
        t.onerror = t.onabort = () => rej(t.error || new Error('Restore failed'));
      });
    }
  };
})();
