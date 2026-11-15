import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper type for registrations
export interface Registration {
  id: string;
  chalan_no: string;
  full_name: string;
  roll_number: string;
  student_phone: string;
  student_email: string;
  parent_phone: string;
  department: string;
  amount: number;
  payment_status: 'pending_payment' | 'pending_approval' | 'approved' | 'rejected';
  transaction_id?: string | null;
  screenshot_url?: string | null;
  rejection_reason?: string | null;
  approved_at?: string | null;
  created_at: string;
}
