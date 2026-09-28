import { createClient } from '@supabase/supabase-js';

// Get keys from env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- FIRESTORE SHIM ---
export const db = 'db_mock';
export const storage = 'storage_mock';

export const collection = (db, path) => path;

export const doc = (db, path, id) => {
  return { table: path, id: id };
};

export const addDoc = async (collectionName, data) => {
  const response = await supabase
    .from(collectionName)
    .insert([data])
    .select();
    
  if (response.error) throw response.error;
  
  const result = Array.isArray(response.data) ? response.data[0] : response.data;
  const id = result?.id || Date.now().toString();
  
  return { id };
};

export const updateDoc = async (docRef, data) => {
  const { error } = await supabase
    .from(docRef.table)
    .update(data)
    .eq('id', docRef.id);
  if (error) throw error;
};

export const deleteDoc = async (docRef) => {
  const { error } = await supabase
    .from(docRef.table)
    .delete()
    .eq('id', docRef.id);
  if (error) throw error;
};

export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, direction = 'asc') => ({ type: 'orderBy', field, direction });

export const query = (collectionName, ...constraints) => {
  return { table: collectionName, constraints };
};

export const getDocs = async (queryObj) => {
  if (typeof queryObj === 'string') {
    // Just a collection
    const { data, error } = await supabase.from(queryObj).select('*');
    if (error) throw error;
    return { 
    docs: (data || []).map(d => ({ id: d?.id, data: () => d })),
    empty: (data || []).length === 0
  };
  }

  let q = supabase.from(queryObj.table).select('*');
  for (const c of queryObj.constraints) {
    if (c.type === 'where') {
      if (c.op === '==') q = q.eq(c.field, c.value);
      else if (c.op === '>') q = q.gt(c.field, c.value);
      else if (c.op === '<') q = q.lt(c.field, c.value);
      else if (c.op === '>=') q = q.gte(c.field, c.value);
      else if (c.op === '<=') q = q.lte(c.field, c.value);
    } else if (c.type === 'orderBy') {
      q = q.order(c.field, { ascending: c.direction === 'asc' });
    }
  }
  const { data, error } = await q;
  if (error) throw error;
  return { 
    docs: (data || []).map(d => ({ id: d?.id, data: () => d })),
    empty: (data || []).length === 0
  };
};

// --- STORAGE SHIM ---
export const ref = (storageObj, path) => path;

export const uploadBytes = async (path, file) => {
  const { data, error } = await supabase.storage.from('media').upload(path, file);
  if (error) throw error;
  return { ref: { fullPath: data.path } };
};

export const getDownloadURL = async (refObj) => {
  const path = refObj.fullPath || refObj;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
};

export const deleteObject = async (path) => {
  const actualPath = path.fullPath || path;
  const { error } = await supabase.storage.from('media').remove([actualPath]);
  if (error) throw error;
};
