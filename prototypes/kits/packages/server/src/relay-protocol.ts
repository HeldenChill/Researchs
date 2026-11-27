export type RelayClientMsg =
  | { t: 'hello'; name: string }
  | { t: 'claim'; obj: string }
  | { t: 'release'; obj: string }
  | { t: 'state'; obj: string; data: unknown }
  | { t: 'event'; data: unknown };

export interface RelayPeer {
  id: string;
  name: string;
}

export type RelayServerMsg =
  | { t: 'welcome'; id: string; peers: RelayPeer[]; owners: Record<string, string>; states: Record<string, unknown> }
  | { t: 'owners'; owners: Record<string, string>; error?: { obj: string; reason: string } }
  | { t: 'peer'; peer: RelayPeer }
  | { t: 'leave'; id: string }
  | { t: 'state'; from: string; obj: string; data: unknown }
  | { t: 'event'; from: string; data: unknown };

export function parseRelayClientMsg(raw: string, maxBytes: number): RelayClientMsg | null {
  if (typeof raw !== 'string' || raw.length > maxBytes) return null;
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || typeof parsed.t !== 'string') return null;

  switch (parsed.t) {
    case 'hello': {
      if (typeof parsed.name !== 'string') return null;
      const trimmed = parsed.name.trim();
      if (trimmed.length < 1 || trimmed.length > 24) return null;
      return { t: 'hello', name: trimmed };
    }
    case 'claim': {
      if (typeof parsed.obj !== 'string' || parsed.obj.length < 1 || parsed.obj.length > 64) return null;
      return { t: 'claim', obj: parsed.obj };
    }
    case 'release': {
      if (typeof parsed.obj !== 'string' || parsed.obj.length < 1 || parsed.obj.length > 64) return null;
      return { t: 'release', obj: parsed.obj };
    }
    case 'state': {
      if (typeof parsed.obj !== 'string' || parsed.obj.length < 1 || parsed.obj.length > 64) return null;
      if (parsed.data === undefined) return null;
      return { t: 'state', obj: parsed.obj, data: parsed.data };
    }
    case 'event': {
      if (parsed.data === undefined) return null;
      return { t: 'event', data: parsed.data };
    }
    default:
      return null;
  }
}
