import { AuditResults } from './audit-engine';

export interface AuditRecord {
  id: string;
  user_id?: string;
  input_data: unknown;
  results_data: AuditResults;
  ai_summary: string;
  total_monthly_savings: number;
  total_annual_savings: number;
  created_at: string;
}

export interface LeadRecord {
  id: string;
  audit_id: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  created_at: string;
}

// In-memory global store to survive hot-reloads during local dev
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface DbData {
  audits: Record<string, AuditRecord>;
  leads: Record<string, LeadRecord>;
}

function loadDb(): DbData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content) as DbData;
    }
  } catch (e) {
    console.error('Error loading db.json:', e);
  }
  return { audits: {}, leads: {} };
}

function saveDb(data: DbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db.json:', e);
  }
}

const globalRef = global as unknown as { mockAudits?: Map<string, AuditRecord>; mockLeads?: Map<string, LeadRecord> };
if (!globalRef.mockAudits) {
  globalRef.mockAudits = new Map<string, AuditRecord>();
}
if (!globalRef.mockLeads) {
  globalRef.mockLeads = new Map<string, LeadRecord>();
}

// Pre-populate globalRef maps from db.json if they are empty
try {
  if (fs.existsSync(DB_FILE)) {
    const db = loadDb();
    if (db.audits && globalRef.mockAudits.size === 0) {
      Object.entries(db.audits).forEach(([id, record]) => {
        globalRef.mockAudits!.set(id, record);
      });
    }
    if (db.leads && globalRef.mockLeads.size === 0) {
      Object.entries(db.leads).forEach(([id, record]) => {
        globalRef.mockLeads!.set(id, record);
      });
    }
  }
} catch (e) {
  console.warn('Failed to pre-populate in-memory store from db.json:', e);
}

export const mockDb = {
  audits: globalRef.mockAudits as Map<string, AuditRecord>,
  leads: globalRef.mockLeads as Map<string, LeadRecord>,
};

import { supabaseUrl, supabaseAnonKey, hasSupabase } from './supabase-config';

export async function saveAudit(record: Omit<AuditRecord, 'created_at'>): Promise<AuditRecord> {
  const newRecord: AuditRecord = {
    ...record,
    created_at: new Date().toISOString(),
  };

  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await supabase
        .from('audits')
        .insert({
          id: newRecord.id,
          user_id: newRecord.user_id,
          input_data: newRecord.input_data,
          results_data: newRecord.results_data,
          ai_summary: newRecord.ai_summary,
          total_monthly_savings: newRecord.total_monthly_savings,
          total_annual_savings: newRecord.total_annual_savings,
          created_at: newRecord.created_at
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as AuditRecord;
    } catch (e) {
      console.warn('Supabase saveAudit failed, falling back to local database:', e);
    }
  }

  // Fallback to local file-based DB
  try {
    const db = loadDb();
    db.audits[newRecord.id] = newRecord;
    saveDb(db);
    // Sync with memory Map
    mockDb.audits.set(newRecord.id, newRecord);
  } catch (err) {
    console.error('Failed to write to local db.json:', err);
    mockDb.audits.set(newRecord.id, newRecord);
  }
  
  return newRecord;
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data as AuditRecord;
    } catch (e) {
      console.warn('Supabase getAudit failed, checking local database:', e);
    }
  }

  // Fallback to local file-based DB
  try {
    const db = loadDb();
    if (db.audits && db.audits[id]) {
      return db.audits[id];
    }
  } catch (err) {
    console.error('Failed to read from local db.json:', err);
  }

  // Backup in-memory read
  return mockDb.audits.get(id) || null;
}

export async function saveLead(record: Omit<LeadRecord, 'id' | 'created_at'>): Promise<LeadRecord> {
  const newRecord: LeadRecord = {
    ...record,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await supabase
        .from('leads')
        .insert({
          id: newRecord.id,
          audit_id: newRecord.audit_id,
          email: newRecord.email,
          company_name: newRecord.company_name,
          role: newRecord.role,
          team_size: newRecord.team_size,
          created_at: newRecord.created_at
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as LeadRecord;
    } catch (e) {
      console.warn('Supabase saveLead failed, falling back to local database:', e);
    }
  }

  // Fallback to local file-based DB
  try {
    const db = loadDb();
    db.leads[newRecord.id] = newRecord;
    saveDb(db);
    // Sync with memory Map
    mockDb.leads.set(newRecord.id, newRecord);
  } catch (err) {
    console.error('Failed to write lead to local db.json:', err);
    mockDb.leads.set(newRecord.id, newRecord);
  }

  return newRecord;
}

export async function getAuditsByUserId(userId: string): Promise<AuditRecord[]> {
  if (hasSupabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AuditRecord[];
    } catch (e) {
      console.warn('Supabase getAuditsByUserId failed, checking local database:', e);
    }
  }

  // Fallback to local file-based DB
  try {
    const db = loadDb();
    const audits = Object.values(db.audits).filter(a => a.user_id === userId);
    return audits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (err) {
    console.error('Failed to read from local db.json:', err);
  }

  // Backup in-memory read
  return Array.from(mockDb.audits.values())
    .filter(a => a.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
