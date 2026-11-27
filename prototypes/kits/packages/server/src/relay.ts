import { randomUUID } from 'node:crypto';
import type { Conn, KitRoom } from './types.ts';
import {
  parseRelayClientMsg,
  type RelayClientMsg,
  type RelayPeer,
  type RelayServerMsg,
} from './relay-protocol.ts';

export interface RelayCtx {
  readonly owners: ReadonlyMap<string, string>;
  readonly states: Map<string, unknown>;
  ownerOf(obj: string): string | null;
  ownedBy(peerId: string): string[];
}

export interface RelayHooks {
  canClaim?(ctx: RelayCtx, peerId: string, obj: string): string | null;
  group?(obj: string): string | null;
  canState?(ctx: RelayCtx, peerId: string, obj: string): boolean;
  validateState?(obj: string, data: unknown): boolean;
  onRelease?(ctx: RelayCtx, peerId: string, obj: string): void;
}

export interface RelayOptions extends RelayHooks {
  maxPlayers?: number;
  maxPayload?: number;
}

interface PeerInfo {
  conn: Conn;
  id: string;
  name: string;
}

export class RelayRoom implements KitRoom {
  readonly maxPlayers: number;
  private readonly maxPayload: number;
  private readonly hooks: RelayHooks;

  private peers = new Map<Conn, PeerInfo>();
  private peerById = new Map<string, PeerInfo>();
  private _owners = new Map<string, string>(); // obj -> peerId
  private _states = new Map<string, unknown>(); // obj -> last data

  constructor(opts?: RelayOptions) {
    this.maxPlayers = opts?.maxPlayers ?? 8;
    this.maxPayload = opts?.maxPayload ?? 16384;
    this.hooks = opts ?? {};
  }

  get size(): number {
    return this.peers.size;
  }

  get full(): boolean {
    return this.peers.size >= this.maxPlayers;
  }

  private makeCtx(): RelayCtx {
    return {
      owners: this._owners,
      states: this._states,
      ownerOf: (obj: string) => this._owners.get(obj) ?? null,
      ownedBy: (peerId: string) => {
        const res: string[] = [];
        for (const [obj, owner] of this._owners) {
          if (owner === peerId) res.push(obj);
        }
        return res;
      },
    };
  }

  private sendMsg(conn: Conn, msg: RelayServerMsg) {
    conn.send(JSON.stringify(msg));
  }

  private broadcast(msg: RelayServerMsg, except?: Conn) {
    const text = JSON.stringify(msg);
    for (const p of this.peers.values()) {
      if (p.conn !== except) {
        p.conn.send(text);
      }
    }
  }

  private ownersObject(): Record<string, string> {
    const obj: Record<string, string> = {};
    for (const [k, v] of this._owners) obj[k] = v;
    return obj;
  }

  private statesObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this._states) obj[k] = v;
    return obj;
  }

  connect(conn: Conn): void {
    const id = randomUUID();
    const name = 'Player';
    const peer: PeerInfo = { conn, id, name };
    this.peers.set(conn, peer);
    this.peerById.set(id, peer);

    const peerList: RelayPeer[] = Array.from(this.peers.values()).map((p) => ({
      id: p.id,
      name: p.name,
    }));

    this.sendMsg(conn, {
      t: 'welcome',
      id,
      peers: peerList,
      owners: this.ownersObject(),
      states: this.statesObject(),
    });

    this.broadcast({ t: 'peer', peer: { id, name } }, conn);
  }

  receive(conn: Conn, data: Uint8Array | string): void {
    if (typeof data !== 'string') return;
    const msg = parseRelayClientMsg(data, this.maxPayload);
    if (!msg) return;

    const peer = this.peers.get(conn);
    if (!peer) return;

    const ctx = this.makeCtx();

    switch (msg.t) {
      case 'hello': {
        peer.name = msg.name;
        this.broadcast({ t: 'peer', peer: { id: peer.id, name: peer.name } });
        break;
      }
      case 'claim': {
        const currentOwner = this._owners.get(msg.obj);
        if (currentOwner === peer.id) {
          this.sendMsg(conn, { t: 'owners', owners: this.ownersObject() });
          return;
        }
        if (currentOwner !== undefined) {
          this.sendMsg(conn, {
            t: 'owners',
            owners: this.ownersObject(),
            error: { obj: msg.obj, reason: 'taken' },
          });
          return;
        }

        if (this.hooks.canClaim) {
          const reason = this.hooks.canClaim(ctx, peer.id, msg.obj);
          if (reason !== null && reason !== undefined) {
            this.sendMsg(conn, {
              t: 'owners',
              owners: this.ownersObject(),
              error: { obj: msg.obj, reason },
            });
            return;
          }
        }

        const grp = this.hooks.group ? this.hooks.group(msg.obj) : null;
        if (grp !== null && grp !== undefined) {
          for (const [otherObj, oPeer] of Array.from(this._owners.entries())) {
            if (oPeer === peer.id && otherObj !== msg.obj) {
              const otherGrp = this.hooks.group ? this.hooks.group(otherObj) : null;
              if (otherGrp === grp) {
                this._owners.delete(otherObj);
                this.hooks.onRelease?.(ctx, peer.id, otherObj);
              }
            }
          }
        }

        this._owners.set(msg.obj, peer.id);
        this.broadcast({ t: 'owners', owners: this.ownersObject() });
        break;
      }
      case 'release': {
        const currentOwner = this._owners.get(msg.obj);
        if (currentOwner !== peer.id) return;

        this._owners.delete(msg.obj);
        this.hooks.onRelease?.(ctx, peer.id, msg.obj);
        this.broadcast({ t: 'owners', owners: this.ownersObject() });
        break;
      }
      case 'state': {
        const allowed = this.hooks.canState
          ? this.hooks.canState(ctx, peer.id, msg.obj)
          : this._owners.get(msg.obj) === peer.id;
        if (!allowed) return;

        if (this.hooks.validateState && !this.hooks.validateState(msg.obj, msg.data)) {
          return;
        }

        this._states.set(msg.obj, msg.data);
        this.broadcast({ t: 'state', from: peer.id, obj: msg.obj, data: msg.data }, conn);
        break;
      }
      case 'event': {
        this.broadcast({ t: 'event', from: peer.id, data: msg.data }, conn);
        break;
      }
    }
  }

  disconnect(conn: Conn): void {
    const peer = this.peers.get(conn);
    if (!peer) return;

    this.peers.delete(conn);
    this.peerById.delete(peer.id);

    const ctx = this.makeCtx();
    let releasedAny = false;

    for (const [obj, oPeer] of Array.from(this._owners.entries())) {
      if (oPeer === peer.id) {
        this._owners.delete(obj);
        this.hooks.onRelease?.(ctx, peer.id, obj);
        releasedAny = true;
      }
    }

    this.broadcast({ t: 'leave', id: peer.id });
    if (releasedAny) {
      this.broadcast({ t: 'owners', owners: this.ownersObject() });
    }
  }

  info(): Record<string, unknown> {
    return { owners: this._owners.size };
  }
}

export function relayRoom(opts?: RelayOptions): RelayRoom {
  return new RelayRoom(opts);
}
