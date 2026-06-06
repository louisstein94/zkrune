// Portable base64 JSON encoding for the passport/action envelopes.
// Works in Node (Buffer) and the browser (btoa/atob over UTF-8).

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  // eslint-disable-next-line no-undef
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  // eslint-disable-next-line no-undef
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeEnvelope(value: unknown): string {
  return toBase64(new TextEncoder().encode(JSON.stringify(value)));
}

export function decodeEnvelope<T>(b64: string): T {
  return JSON.parse(new TextDecoder().decode(fromBase64(b64))) as T;
}

/** Read a header case-insensitively from a plain object or a Headers instance. */
export function readHeader(
  headers: Record<string, string | undefined> | Headers,
  name: string,
): string | undefined {
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name) ?? undefined;
  }
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers as Record<string, string | undefined>)) {
    if (k.toLowerCase() === lower) return v ?? undefined;
  }
  return undefined;
}
