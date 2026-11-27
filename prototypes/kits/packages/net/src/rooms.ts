/** Mirror of server `RoomInfo` from `/api/rooms`. */
export interface RoomInfo {
  id: string;
  name: string;
  locked: boolean;
  players: number;
  max: number;
  phase?: string;
  biome?: string;
}

export type JoinTarget =
  | { kind: 'quick' }
  | { kind: 'code'; code: string }
  | { kind: 'id'; id: string; pass: string }
  | { kind: 'create'; name: string; isPublic: boolean; pass: string };

/** WebSocket close codes the server uses to reject a join. */
export const REJECT_MESSAGES: Record<number, string> = {
  4001: 'Wrong password',
  4002: 'Room is full',
  4003: 'Room no longer exists',
};

export function escapeUiText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

/** Query string for `/ws` matching the server's `parseJoin`. */
export function joinQuery(t: JoinTarget): string {
  const q = new URLSearchParams();
  if (t.kind === 'create') {
    q.set('create', '1');
    q.set('name', t.name);
    if (!t.isPublic) {
      q.set('private', '1');
      q.set('pass', t.pass);
    }
  } else if (t.kind === 'id') {
    q.set('id', t.id);
    if (t.pass) q.set('pass', t.pass);
  } else if (t.kind === 'code') {
    q.set('room', t.code);
  }
  const s = q.toString();
  return s ? '?' + s : '';
}

/** True when a poll returned the same rows, so the list DOM can stay (keeps clicks from being eaten). */
export function sameRooms(a: RoomInfo[], b: RoomInfo[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Fetch the room list now and every `intervalMs` until stopped. */
export class RoomPoller {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private fetchFn: () => Promise<RoomInfo[]>,
    private onRooms: (r: RoomInfo[]) => void,
    private intervalMs = 3000,
  ) {}

  get running(): boolean {
    return this.timer !== null;
  }

  start(): void {
    if (this.timer) return;
    this.poll();
    this.timer = setInterval(() => this.poll(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  poll(): void {
    this.fetchFn().then(
      (r) => this.onRooms(r),
      () => {},
    );
  }
}

export async function fetchRooms(): Promise<RoomInfo[]> {
  const res = await fetch('/api/rooms', { cache: 'no-store' });
  return res.ok ? ((await res.json()) as RoomInfo[]) : [];
}

/** Link a friend opens to join this room by its code (room codes only; created rooms join from the list). */
export function inviteLink(origin: string, code: string): string | null {
  return code ? `${origin}/?room=${encodeURIComponent(code)}` : null;
}
