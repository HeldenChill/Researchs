import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Connection } from '../src/connection.ts';
import { wsUrl } from '../src/url.ts';

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
    this.readyState = 3; // CLOSED
    this.onclose?.({ code: 1000, reason: 'normal' });
  }

  fireOpen() {
    this.readyState = 1; // OPEN
    this.onopen?.();
  }

  fireText(s: string) {
    this.onmessage?.({ data: s });
  }

  fireBinary(data: Uint8Array) {
    this.onmessage?.({ data: data.buffer });
  }

  fireClose(code: number, reason: string) {
    this.readyState = 3;
    this.onclose?.({ code, reason });
  }
}

describe('Connection', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  it('queues text while connecting and flushes on open in order', () => {
    const conn = new Connection('ws://test');
    const ws = FakeWebSocket.instances[0]!;

    conn.send('msg1');
    conn.send('msg2');
    expect(ws.sent).toHaveLength(0);

    ws.fireOpen();
    expect(ws.sent).toEqual(['msg1', 'msg2']);
  });

  it('send with queue false while connecting is dropped', () => {
    const conn = new Connection('ws://test');
    const ws = FakeWebSocket.instances[0]!;

    conn.send('dropped', false);
    ws.fireOpen();
    expect(ws.sent).toHaveLength(0);
  });

  it('binary message calls onBinary with Uint8Array, text calls onText', () => {
    const conn = new Connection('ws://test');
    const ws = FakeWebSocket.instances[0]!;
    ws.fireOpen();

    let textReceived = '';
    let binReceived: Uint8Array | null = null;
    conn.onText = (s) => (textReceived = s);
    conn.onBinary = (b) => (binReceived = b);

    ws.fireText('hello');
    expect(textReceived).toBe('hello');

    const bytes = new Uint8Array([1, 2, 3]);
    ws.fireBinary(bytes);
    expect(binReceived ? Array.from(binReceived) : null).toEqual([1, 2, 3]);
  });

  it('close silences onClose', () => {
    const conn = new Connection('ws://test');
    const ws = FakeWebSocket.instances[0]!;
    ws.fireOpen();

    let closed = false;
    conn.onClose = () => (closed = true);

    conn.close();
    expect(closed).toBe(false);
  });

  it('wsUrl uses wss on https', () => {
    vi.stubGlobal('location', { protocol: 'https:', host: 'example.com' });
    expect(wsUrl('?room=1', '/ws')).toBe('wss://example.com/ws?room=1');

    vi.stubGlobal('location', { protocol: 'http:', host: 'localhost:5174' });
    expect(wsUrl()).toBe('ws://localhost:5174/ws');
  });
});
