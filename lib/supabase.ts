import { AuditResults } from './audit-engine';

export interface AuditRecord {
  id: string;
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
const globalRef = global as unknown as { mockAudits?: Map<string, AuditRecord>; mockLeads?: Map<string, LeadRecord> };
if (!globalRef.mockAudits) {
  globalRef.mockAudits = new Map<string, AuditRecord>();
}
if (!globalRef.mockLeads) {
  globalRef.mockLeads = new Map<string, LeadRecord>();
}

export const mockDb = {
  audits: globalRef.mockAudits as Map<string, AuditRecord>,
  leads: globalRef.mockLeads as Map<string, LeadRecord>,
};

// Supabase client initialization (only if keys exist)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = !!(supabaseUrl && supabaseAnonKey);

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
      console.warn('Supabase saveAudit failed, falling back to local memory database:', e);
    }
  }

  // Fallback to local memory DB
  mockDb.audits.set(newRecord.id, newRecord);
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
      console.warn('Supabase getAudit failed, checking local memory database:', e);
    }
  }

  // Fallback to local memory DB
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
      console.warn('Supabase saveLead failed, falling back to local memory database:', e);
    }
  }

  // Fallback to local memory DB
  mockDb.leads.set(newRecord.id, newRecord);
  return newRecord;
}
