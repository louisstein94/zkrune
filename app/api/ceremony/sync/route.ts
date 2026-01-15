import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'ceremony-zkeys';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST - Sync DB with storage (clean old records, add real ones)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Storage not configured'
      }, { status: 500 });
    }

    if (action === 'clean') {
      // Delete all old ceremony contributions
      const { error } = await supabase
        .from('ceremony_contributions')
        .delete()
        .neq('contribution_index', 0); // Delete all (index != 0 catches everything)
      
      if (error) {
        console.error('Error cleaning DB:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to clean DB'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'DB cleaned successfully'
      });
    }

    if (action === 'sync') {
      // Get current zkey count from storage
      const { data: files } = await supabase.storage
        .from(BUCKET_NAME)
        .list('age-verification');
      
      const zkeyFiles = (files || [])
        .filter(f => f.name.endsWith('.zkey'))
        .sort((a, b) => {
          const indexA = parseInt(a.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
          const indexB = parseInt(b.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
          return indexA - indexB;
        });
      
      // Create DB entries for each zkey (genesis entry for _0001)
      const contributions = zkeyFiles.map((file, idx) => {
        const index = parseInt(file.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
        return {
          id: crypto.randomUUID(),
          contribution_index: index,
          contributor_name: index === 1 ? 'zkRune Genesis' : `Contributor #${index}`,
          contribution_hash: `storage_${file.name}_${file.created_at}`,
          circuits: ['age-verification'], // Just tracking
          verified: true
        };
      });
      
      // Clear and insert
      await supabase.from('ceremony_contributions').delete().neq('contribution_index', 0);
      
      if (contributions.length > 0) {
        const { error } = await supabase.from('ceremony_contributions').insert(contributions);
        if (error) {
          console.error('Error syncing DB:', error);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Synced ${contributions.length} contributions from storage`,
        contributions: contributions.length
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "clean" or "sync"'
    }, { status: 400 });
  } catch (error) {
    console.error('Error in ceremony sync:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET - Show sync status
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Storage not configured'
    }, { status: 500 });
  }

  // Get storage count
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list('age-verification');
  
  const zkeyCount = (files || []).filter(f => f.name.endsWith('.zkey')).length;
  
  // Get DB count
  const { count } = await supabase
    .from('ceremony_contributions')
    .select('*', { count: 'exact', head: true });
  
  return NextResponse.json({
    success: true,
    data: {
      storageZkeyCount: zkeyCount,
      dbRecordCount: count || 0,
      inSync: zkeyCount === (count || 0),
      actions: {
        clean: 'POST with {action: "clean"} to delete all DB records',
        sync: 'POST with {action: "sync"} to sync DB with storage'
      }
    }
  });
}
