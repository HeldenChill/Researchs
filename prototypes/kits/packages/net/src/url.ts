export function wsUrl(query?: string, path?: string): string {
  const loc = typeof location !== 'undefined' ? location : { protocol: 'http:', host: 'localhost:5174' };
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  const p = path ?? '/ws';
  const q = query ?? '';
  return `${proto}//${loc.host}${p}${q}`;
}
