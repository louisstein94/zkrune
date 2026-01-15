import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'ceremony-zkeys';
const CIRCUITS = [
  'age-verification',
  'anonymous-reputation',
  'balance-proof',
  'credential-proof',
  'hash-preimage',
  'membership-proof',
  'nft-ownership',
  'patience-proof',
  'private-voting',
  'quadratic-voting',
  'range-proof',
  'signature-verification',
  'token-swap'
];

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET - Get ceremony status for all circuits
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Storage not configured',
        setupRequired: true
      }, { status: 500 });
    }
    
    // Get status for each circuit
    const circuitStatus: Record<string, { currentIndex: number; latestFile: string | null }> = {};
    let totalContributions = 0;
    let minContributions = Infinity;
    
    for (const circuit of CIRCUITS) {
      const { data: files } = await supabase.storage
        .from(BUCKET_NAME)
        .list(circuit);
      
      const zkeyFiles = (files || [])
        .filter(f => f.name.endsWith('.zkey'))
        .sort((a, b) => {
          const indexA = parseInt(a.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
          const indexB = parseInt(b.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
          return indexB - indexA;
        });
      
      const currentIndex = zkeyFiles.length > 0
        ? parseInt(zkeyFiles[0].name.match(/_(\d+)\.zkey$/)?.[1] || '0')
        : 0;
      
      circuitStatus[circuit] = {
        currentIndex,
        latestFile: zkeyFiles[0]?.name || null
      };
      
      totalContributions += currentIndex;
      if (currentIndex < minContributions) {
        minContributions = currentIndex;
      }
    }
    
    // Get contributions from database
    const { data: contributions } = await supabase
      .from('ceremony_contributions')
      .select('*')
      .order('contribution_index', { ascending: true });
    
    return NextResponse.json({
      success: true,
      data: {
        phase: minContributions >= 5 ? 'ready_to_finalize' : 'accepting_contributions',
        circuits: circuitStatus,
        totalCircuits: CIRCUITS.length,
        minContributions,
        requiredContributions: 5,
        contributions: contributions || [],
        initialized: minContributions > 0
      }
    });
  } catch (error) {
    console.error('Error getting ceremony status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
