export async function hashProof(proof: object): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(proof));

  if (typeof globalThis.crypto?.subtle?.digest === 'function') {
    const buffer = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    return bufferToHex(new Uint8Array(buffer));
  }

  const { createHash } = await import('crypto');
  return createHash('sha256').update(encoded).digest('hex');
}

function bufferToHex(bytes: Uint8Array): string {
  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'));
  }
  return hex.join('');
}
