import { describe, expect, it, afterEach } from 'vitest';
import { parseArgs } from '../src/args.ts';
import { startServer, type RunningServer } from '../src/host.ts';
import type { KitRoom, Conn } from '../src/types.ts';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('host and parseArgs', () => {
  let server: RunningServer<any> | null = null;

  afterEach(() => {
    if (server) {
      server.close();
      server = null;
    }
  });

  it('parseArgs defaults', () => {
    const a1 = parseArgs([], {});
    expect(a1.port).toBe(5174);
    expect(a1.host).toBe('0.0.0.0');

    const a2 = parseArgs(['--local', '--port', '6000'], {});
    expect(a2.port).toBe(6000);
    expect(a2.host).toBe('127.0.0.1');

    const a3 = parseArgs([], { PORT: '7000' });
    expect(a3.port).toBe(7000);
  });

  it('echo room round-trips text and binary', async () => {
    class EchoRoom implements KitRoom {
      size = 0;
      full = false;
      maxPlayers = 10;
      connect(conn: Conn) {
        this.size++;
      }
      disconnect(conn: Conn) {
        this.size--;
      }
      receive(conn: Conn, data: Uint8Array | string) {
        conn.send(data);
      }
    }

    server = await startServer({
      name: 'TestEcho',
      makeRoom: () => new EchoRoom(),
      args: parseArgs(['--local', '--port', '0']),
    });

    const ws = new WebSocket(`ws://127.0.0.1:${server.port}/ws`);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = reject;
    });

    // Test text
    const textPromise = new Promise<string>((resolve) => {
      ws.onmessage = (ev) => {
        if (typeof ev.data === 'string') resolve(ev.data);
      };
    });
    ws.send('hi');
    expect(await textPromise).toBe('hi');

    // Test binary
    const binPromise = new Promise<Uint8Array>((resolve) => {
      ws.onmessage = async (ev) => {
        if (ev.data instanceof Blob) {
          const buf = await ev.data.arrayBuffer();
          resolve(new Uint8Array(buf));
        } else if (ev.data instanceof ArrayBuffer) {
          resolve(new Uint8Array(ev.data));
        }
      };
    });
    ws.send(new Uint8Array([1, 2, 3]));
    const binRes = await binPromise;
    expect(Array.from(binRes)).toEqual([1, 2, 3]);

    ws.close();
  });

  it('full room rejects with 4002', async () => {
    class SingleRoom implements KitRoom {
      size = 0;
      full = false;
      maxPlayers = 1;
      connect(conn: Conn) {
        this.size = 1;
        this.full = true;
      }
      disconnect(conn: Conn) {
        this.size = 0;
        this.full = false;
      }
      receive() {}
    }

    server = await startServer({
      name: 'TestFull',
      makeRoom: () => new SingleRoom(),
      args: parseArgs(['--local', '--port', '0']),
    });

    const ws1 = new WebSocket(`ws://127.0.0.1:${server.port}/ws?create=1&name=A`);
    await new Promise<void>((resolve, reject) => {
      ws1.onopen = () => resolve();
      ws1.onerror = reject;
    });

    const roomsRes = await fetch(`http://127.0.0.1:${server.port}/api/rooms`);
    const roomsList = (await roomsRes.json()) as any[];
    expect(roomsList.length).toBe(1);
    const roomId = roomsList[0].id;

    const port = server.port;
    const closeCodePromise = new Promise<number>((resolve) => {
      const ws2 = new WebSocket(`ws://127.0.0.1:${port}/ws?id=${roomId}`);
      ws2.onclose = (ev) => resolve(ev.code);
    });

    expect(await closeCodePromise).toBe(4002);
    ws1.close();
  });

  it('missing room rejects with 4003', async () => {
    server = await startServer({
      name: 'TestMissing',
      makeRoom: () => ({
        size: 0,
        full: false,
        maxPlayers: 10,
        connect() {},
        disconnect() {},
        receive() {},
      }),
      args: parseArgs(['--local', '--port', '0']),
    });

    const closeCodePromise = new Promise<number>((resolve) => {
      const ws = new WebSocket(`ws://127.0.0.1:${server!.port}/ws?id=nope`);
      ws.onclose = (ev) => resolve(ev.code);
    });

    expect(await closeCodePromise).toBe(4003);
  });

  it('/api/rooms lists rooms with info fields', async () => {
    server = await startServer({
      name: 'TestInfo',
      makeRoom: () => ({
        size: 0,
        full: false,
        maxPlayers: 8,
        connect() {},
        disconnect() {},
        receive() {},
        info: () => ({ custom: 'value123' }),
      }),
      args: parseArgs(['--local', '--port', '0']),
    });

    const ws = new WebSocket(`ws://127.0.0.1:${server.port}/ws?create=1&name=MyRoom`);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = reject;
    });

    const res = await fetch(`http://127.0.0.1:${server.port}/api/rooms`);
    const list = (await res.json()) as any[];
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({
      name: 'MyRoom',
      max: 8,
      custom: 'value123',
    });

    ws.close();
  });

  it('missing distDir serves websocket only', async () => {
    const missingDir = join(tmpdir(), 'nope-' + Date.now());
    server = await startServer({
      name: 'TestNoDist',
      makeRoom: () => ({
        size: 0,
        full: false,
        maxPlayers: 10,
        connect() {},
        disconnect() {},
        receive() {},
      }),
      distDir: missingDir,
      args: parseArgs(['--local', '--port', '0']),
    });

    const res = await fetch(`http://127.0.0.1:${server.port}/`);
    expect(res.status).toBe(404);

    const ws = new WebSocket(`ws://127.0.0.1:${server.port}/ws`);
    const opened = await new Promise<boolean>((resolve) => {
      ws.onopen = () => resolve(true);
      ws.onerror = () => resolve(false);
    });
    expect(opened).toBe(true);
    ws.close();
  });

  it('serves static file with gzip and etag', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'static-test-'));
    try {
      const largeContent = '<html><body>' + 'x'.repeat(2000) + '</body></html>';
      writeFileSync(join(tmp, 'index.html'), largeContent);
      mkdirSync(join(tmp, 'assets'));
      writeFileSync(join(tmp, 'assets', 'a.js'), 'console.log("hello");');

      server = await startServer({
        name: 'TestStatic',
        makeRoom: () => ({
          size: 0,
          full: false,
          maxPlayers: 10,
          connect() {},
          disconnect() {},
          receive() {},
        }),
        distDir: tmp,
        args: parseArgs(['--local', '--port', '0']),
      });

      // GET / -> 200 text/html
      const r1 = await fetch(`http://127.0.0.1:${server.port}/`, {
        headers: { 'accept-encoding': 'gzip' },
      });
      expect(r1.status).toBe(200);
      expect(r1.headers.get('content-type')).toContain('text/html');
      expect(r1.headers.get('content-encoding')).toBe('gzip');
      const etag = r1.headers.get('etag');
      expect(etag).toBeTruthy();

      // GET /some/route -> SPA fallback to index.html
      const r2 = await fetch(`http://127.0.0.1:${server.port}/some/route`);
      expect(r2.status).toBe(200);
      expect(r2.headers.get('content-type')).toContain('text/html');

      // GET /assets/a.js -> Cache-Control immutable
      const r3 = await fetch(`http://127.0.0.1:${server.port}/assets/a.js`);
      expect(r3.status).toBe(200);
      expect(r3.headers.get('cache-control')).toContain('immutable');

      // GET / with if-none-match -> 304
      const r4 = await fetch(`http://127.0.0.1:${server.port}/`, {
        headers: { 'if-none-match': etag! },
      });
      expect(r4.status).toBe(304);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
