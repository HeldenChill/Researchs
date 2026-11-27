export interface Conn {
  send(data: Uint8Array | string): void;
  close(): void;
}

export interface KitRoom {
  readonly size: number;
  readonly full: boolean;
  readonly maxPlayers: number;
  connect(conn: Conn): void;
  receive(conn: Conn, data: Uint8Array | string): void;
  disconnect(conn: Conn): void;
  tick?(): void;
  /** extra fields merged into /api/rooms entries */
  info?(): Record<string, unknown>;
}

export type JoinRequest =
  | { kind: 'quick' }
  | { kind: 'code'; code: string }
  | { kind: 'id'; id: string; pass: string }
  | { kind: 'create'; name: string; isPublic: boolean; pass: string };

export const REJECT_CODES = { bad_pass: 4001, full: 4002, missing: 4003 } as const;
export type RejectReason = keyof typeof REJECT_CODES;

export interface RoomEntry<R extends KitRoom> {
  room: R;
  code: string;
  name: string;
  password: string | null;
  isPublic: boolean;
  emptySince: number;
}

export type JoinResult<R extends KitRoom> = { ok: true; entry: RoomEntry<R> } | { ok: false; reason: RejectReason };

export interface RoomInfo {
  id: string;
  name: string;
  locked: boolean;
  players: number;
  max: number;
  [k: string]: unknown;
}
