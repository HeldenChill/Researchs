import { Connection } from './connection.ts';
import type { RelayPeer, RelayServerMsg } from './protocol.ts';

export interface RelayClientEvents {
  onWelcome?(id: string): void;
  onOwners?(owners: ReadonlyMap<string, string>, error?: { obj: string; reason: string }): void;
  onPeer?(peer: RelayPeer): void;
  onLeave?(id: string): void;
  onState?(from: string, obj: string, data: unknown): void;
  onEvent?(from: string, data: unknown): void;
  onClose?(code: number, reason: string): void;
}

export class RelayClient {
  private conn: Connection;
  private events: RelayClientEvents;
  id: string | null = null;
  readonly owners = new Map<string, string>();
  readonly peers = new Map<string, RelayPeer>();
  readonly states = new Map<string, unknown>();

  constructor(url: string, events: RelayClientEvents) {
    this.events = events;
    this.conn = new Connection(url);

    this.conn.onText = (raw) => {
      let msg: RelayServerMsg;
      try {
        msg = JSON.parse(raw);
      } catch {
        console.warn('Bad JSON from server:', raw);
        return;
      }
      if (!msg || typeof msg !== 'object' || typeof msg.t !== 'string') {
        console.warn('Unknown message format from server:', msg);
        return;
      }

      switch (msg.t) {
        case 'welcome': {
          this.id = msg.id;
          this.peers.clear();
          for (const p of msg.peers) {
            this.peers.set(p.id, p);
          }
          this.owners.clear();
          for (const [k, v] of Object.entries(msg.owners)) {
            this.owners.set(k, v);
          }
          this.states.clear();
          for (const [k, v] of Object.entries(msg.states)) {
            this.states.set(k, v);
          }
          this.events.onWelcome?.(this.id);
          break;
        }
        case 'owners': {
          this.owners.clear();
          for (const [k, v] of Object.entries(msg.owners)) {
            this.owners.set(k, v);
          }
          this.events.onOwners?.(this.owners, msg.error);
          break;
        }
        case 'peer': {
          this.peers.set(msg.peer.id, msg.peer);
          this.events.onPeer?.(msg.peer);
          break;
        }
        case 'leave': {
          this.peers.delete(msg.id);
          this.events.onLeave?.(msg.id);
          break;
        }
        case 'state': {
          this.states.set(msg.obj, msg.data);
          this.events.onState?.(msg.from, msg.obj, msg.data);
          break;
        }
        case 'event': {
          this.events.onEvent?.(msg.from, msg.data);
          break;
        }
        default:
          console.warn('Unknown message type from server:', (msg as any).t);
      }
    };

    this.conn.onClose = (code, reason) => {
      this.events.onClose?.(code, reason);
    };
  }

  ownerOf(obj: string): string | null {
    return this.owners.get(obj) ?? null;
  }

  isMine(obj: string): boolean {
    return this.id !== null && this.owners.get(obj) === this.id;
  }

  hello(name: string): void {
    this.conn.send(JSON.stringify({ t: 'hello', name }));
  }

  claim(obj: string): void {
    this.conn.send(JSON.stringify({ t: 'claim', obj }));
  }

  release(obj: string): void {
    this.conn.send(JSON.stringify({ t: 'release', obj }));
  }

  state(obj: string, data: unknown): void {
    // not queued (stale state is useless)
    this.conn.send(JSON.stringify({ t: 'state', obj, data }), false);
  }

  event(data: unknown): void {
    this.conn.send(JSON.stringify({ t: 'event', data }));
  }

  close(): void {
    this.conn.close();
  }
}
