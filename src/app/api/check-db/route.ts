import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your_supabase')) {
    return NextResponse.json(
      { error: 'Supabase credentials are not set in .env.local yet.' },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Check connection or execute basic check
  try {
    const { data, error } = await supabase.from('convocation_registrations').select('count', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      return NextResponse.json({
        success: false,
        message: 'Table "convocation_registrations" does not exist yet. Please execute supabase_schema.sql in Supabase SQL editor.',
        needs_migration: true
      });
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection verified and table exists!',
      data
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
