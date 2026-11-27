import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RelayClient } from '../src/relay-client.ts';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  url: string;
  binaryType = 'blob';
  readyState = 0; // CONNECTING
  sent: (string | Uint8Array)[] = [];

  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: any }) => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string | Uint8Array) {
    this.sent.push(data);
  }

  close() {
    this.readyState = 3;
    this.onclose?.({ code: 1000, reason: 'normal' });
  }

  fireOpen() {
    this.readyState = 1;
    this.onopen?.();
  }

  fireText(s: string) {
    this.onmessage?.({ data: s });
  }

  fireClose(code: number, reason: string) {
    this.readyState = 3;
    this.onclose?.({ code, reason });
  }
}

describe('RelayClient', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  it('welcome fills id peers owners states then onWelcome', () => {
    let welcomeCalled = false;
    let welcomeId = '';
    const client = new RelayClient('ws://test', {
      onWelcome: (id) => {
        welcomeCalled = true;
        welcomeId = id;
      },
    });
    const ws = FakeWebSocket.instances[0]!;
    ws.fireOpen();

    ws.fireText(
      JSON.stringify({
        t: 'welcome',
        id: 'p1',
        peers: [{ id: 'p1', name: 'Alice' }],
        owners: { car: 'p1' },
        states: { car: { speed: 10 } },
      }),
    );

    expect(welcomeCalled).toBe(true);
    expect(welcomeId).toBe('p1');
    expect(client.id).toBe('p1');
    expect(client.peers.get('p1')).toEqual({ id: 'p1', name: 'Alice' });
    expect(client.owners.get('car')).toBe('p1');
    expect(client.states.get('car')).toEqual({ speed: 10 });
    expect(client.isMine('car')).toBe(true);
  });

  it('owners msg replaces map and passes error', () => {
    let ownersReceived: ReadonlyMap<string, string> | undefined;
    let errorReceived: any = null;
    const client = new RelayClient('ws://test', {
      onOwners: (owners, err) => {
        ownersReceived = owners;
        errorReceived = err;
      },
    });
    const ws = FakeWebSocket.instances[0]!;
    ws.fireOpen();

    ws.fireText(
      JSON.stringify({
        t: 'owners',
        owners: { seat0: 'p2' },
        error: { obj: 'seat0', reason: 'taken' },
      }),
    );

    expect(client.owners.get('seat0')).toBe('p2');
    expect((ownersReceived as ReadonlyMap<string, string> | undefined)?.get('seat0')).toBe('p2');
    expect(errorReceived).toEqual({ obj: 'seat0', reason: 'taken' });
  });

  it('state msg updates states and calls onState', () => {
    let stateCall: any = null;
    const client = new RelayClient('ws://test', {
      onState: (from, obj, data) => {
        stateCall = { from, obj, data };
      },
    });
    const ws = FakeWebSocket.instances[0]!;
    ws.fireOpen();

    ws.fireText(
      JSON.stringify({
        t: 'state',
        from: 'p3',
        obj: 'car',
        data: { speed: 20 },
      }),
    );

    expect(client.states.get('car')).toEqual({ speed: 20 });
    expect(stateCall).toEqual({ from: 'p3', obj: 'car', data: { speed: 20 } });
  });

  it('leave removes peer', () => {
    let leaveId = '';
    const client = new RelayClient('ws://test', {
      onLeave: (id) => (leaveId = id),
    });
    const ws = FakeWebSocket.instances[0]!;
    ws.fireOpen();

    ws.fireText(
      JSON.stringify({
        t: 'welcome',
        id: 'p1',
        peers: [
          { id: 'p1', name: 'Alice' },
          { id: 'p2', name: 'Bob' },
        ],
        owners: {},
        states: {},
      }),
    );
    expect(client.peers.has('p2')).toBe(true);

    ws.fireText(JSON.stringify({ t: 'leave', id: 'p2' }));
    expect(client.peers.has('p2')).toBe(false);
    expect(leaveId).toBe('p2');
  });

  it('bad json ignored', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const client = new RelayClient('ws://test', {});
    const ws = FakeWebSocket.instances[0]!;
    ws.fireOpen();

    ws.fireText('not json');
    ws.fireText('{"t":"invalid_type_abc"}');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
