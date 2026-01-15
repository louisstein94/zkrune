import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client with service role for storage operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

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

// GET - Download latest zkey for a circuit
// Usage: GET /api/ceremony/zkey?circuit=age-verification
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const circuit = searchParams.get('circuit');
    
    if (!circuit || !CIRCUITS.includes(circuit)) {
      return NextResponse.json({
        success: false,
        error: `Invalid circuit. Valid circuits: ${CIRCUITS.join(', ')}`
      }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Storage not configured'
      }, { status: 500 });
    }
    
    // List files for this circuit to find the latest
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(circuit, {
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (listError) {
      console.error('Error listing files:', listError);
      return NextResponse.json({
        success: false,
        error: 'Failed to list zkey files'
      }, { status: 500 });
    }
    
    // Filter to only .zkey files and find the one with highest index
    const zkeyFiles = (files || [])
      .filter(f => f.name.endsWith('.zkey'))
      .sort((a, b) => {
        const indexA = parseInt(a.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
        const indexB = parseInt(b.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
        return indexB - indexA;
      });
    
    if (zkeyFiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No zkey files found for this circuit. Ceremony may not be initialized.'
      }, { status: 404 });
    }
    
    const latestFile = zkeyFiles[0];
    const currentIndex = parseInt(latestFile.name.match(/_(\d+)\.zkey$/)?.[1] || '0');
    
    // Get signed URL for download (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(`${circuit}/${latestFile.name}`, 3600);
    
    if (urlError || !urlData) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate download URL'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        circuit,
        currentIndex,
        nextIndex: currentIndex + 1,
        fileName: latestFile.name,
        downloadUrl: urlData.signedUrl,
        expiresIn: 3600
      }
    });
  } catch (error) {
    console.error('Error in zkey GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Upload new zkey contribution
// Usage: POST /api/ceremony/zkey with multipart form data
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const circuit = formData.get('circuit') as string;
    const contributorName = formData.get('contributorName') as string;
    const contributionHash = formData.get('contributionHash') as string;
    const zkeyFile = formData.get('zkey') as File;
    
    if (!circuit || !CIRCUITS.includes(circuit)) {
      return NextResponse.json({
        success: false,
        error: `Invalid circuit. Valid circuits: ${CIRCUITS.join(', ')}`
      }, { status: 400 });
    }
    
    if (!contributorName || !contributionHash || !zkeyFile) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: contributorName, contributionHash, zkey'
      }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Storage not configured'
      }, { status: 500 });
    }
    
    // Get current index
    const { data: files } = await supabase.storage
      .from(BUCKET_NAME)
      .list(circuit, {
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
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
    const newIndex = currentIndex + 1;
    const newFileName = `${circuit}_${String(newIndex).padStart(4, '0')}.zkey`;
    
    // Upload the new zkey
    const arrayBuffer = await zkeyFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`${circuit}/${newFileName}`, arrayBuffer, {
        contentType: 'application/octet-stream',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading zkey:', uploadError);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload zkey'
      }, { status: 500 });
    }
    
    // Record the contribution in the database
    const { error: dbError } = await supabase
      .from('ceremony_contributions')
      .insert({
        id: crypto.randomUUID(),
        contribution_index: newIndex,
        contributor_name: contributorName,
        contribution_hash: contributionHash,
        circuits: [circuit],
        verified: false // Will be verified later
      });
    
    if (dbError) {
      console.error('Error recording contribution:', dbError);
      // Don't fail - zkey is uploaded, just logging failed
    }
    
    return NextResponse.json({
      success: true,
      data: {
        circuit,
        index: newIndex,
        fileName: newFileName,
        contributorName,
        contributionHash
      }
    });
  } catch (error) {
    console.error('Error in zkey POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET ceremony status for all circuits
export async function OPTIONS() {
  return NextResponse.json({
    circuits: CIRCUITS,
    usage: {
      download: 'GET /api/ceremony/zkey?circuit=<circuit-name>',
      upload: 'POST /api/ceremony/zkey (multipart form: circuit, contributorName, contributionHash, zkey)'
    }
  });
}
