import type { KitRoom, RoomEntry, JoinRequest, JoinResult, RoomInfo } from './types.ts';

export const EMPTY_TTL_MS = 60000;
export const NAME_MAX = 24;
export const PASS_MAX = 32;

function sanitizeName(name: string): string {
  return name.trim().slice(0, NAME_MAX) || 'Room';
}

/** Map `/ws` query params to a join request. */
export function parseJoin(q: URLSearchParams): JoinRequest {
  const pass = (q.get('pass') ?? '').slice(0, PASS_MAX);
  if (q.get('create') === '1') {
    return { kind: 'create', name: q.get('name') ?? '', isPublic: q.get('private') !== '1', pass };
  }
  const id = q.get('id');
  if (id) return { kind: 'id', id, pass };
  const code = q.get('room');
  if (code) return { kind: 'code', code };
  return { kind: 'quick' };
}

export class Rooms<R extends KitRoom> {
  readonly list = new Map<string, RoomEntry<R>>();
  private seq = 0;
  private readonly makeRoom: () => R;
  private readonly emptyTtlMs: number;

  constructor(makeRoom: () => R, emptyTtlMs = EMPTY_TTL_MS) {
    this.makeRoom = makeRoom;
    this.emptyTtlMs = emptyTtlMs;
  }

  /** Pick or create the room for a new connection, or say why not. */
  resolve(req: JoinRequest): JoinResult<R> {
    switch (req.kind) {
      case 'code': {
        const key = 'p:' + req.code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        const e = this.list.get(key) ?? this.create(key, key.slice(2) || 'Room', false, null);
        return { ok: true, entry: e };
      }
      case 'id': {
        const e = this.list.get(req.id);
        if (!e) return { ok: false, reason: 'missing' };
        if (e.password !== null && e.password !== req.pass) return { ok: false, reason: 'bad_pass' };
        if (e.room.full) return { ok: false, reason: 'full' };
        return { ok: true, entry: e };
      }
      case 'create': {
        const password = !req.isPublic && req.pass ? req.pass.slice(0, PASS_MAX) : null;
        const n = ++this.seq;
        return { ok: true, entry: this.create('c:' + n, sanitizeName(req.name), false, password) };
      }
      case 'quick': {
        let best: RoomEntry<R> | null = null;
        for (const e of this.list.values()) {
          if (e.isPublic && !e.room.full && (!best || e.room.size > best.room.size)) best = e;
        }
        if (!best) {
          const n = ++this.seq;
          best = this.create('q:' + n, `Quick Play ${n}`, true, null);
        }
        return { ok: true, entry: best };
      }
    }
  }

  /** `isPublic` = eligible for Quick Play matchmaking. */
  create(code: string, name: string, isPublic: boolean, password: string | null): RoomEntry<R> {
    const e: RoomEntry<R> = {
      room: this.makeRoom(),
      code,
      name,
      password,
      isPublic,
      emptySince: Date.now(),
    };
    this.list.set(code, e);
    return e;
  }

  tickAll(now = Date.now()): void {
    for (const [k, e] of this.list) {
      if (e.room.size === 0) {
        if (now - e.emptySince > this.emptyTtlMs) {
          this.list.delete(k);
          continue;
        }
      } else {
        e.emptySince = now;
      }
      e.room.tick?.();
    }
  }

  stats(): RoomInfo[] {
    return [...this.list.values()].map((e) => ({
      id: e.code,
      name: e.name,
      locked: e.password !== null,
      players: e.room.size,
      max: e.room.maxPlayers,
      ...(e.room.info ? e.room.info() : {}),
    }));
  }
}
