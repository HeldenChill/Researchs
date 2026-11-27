import uWS from 'uWebSockets.js';
import { exec } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { extname } from 'node:path';
import { Rooms, parseJoin } from './rooms.ts';
import { REJECT_CODES } from './types.ts';
import type { KitRoom, Conn, JoinRequest } from './types.ts';
import { parseArgs, type ServerArgs } from './args.ts';
import { loadStaticFiles } from './static.ts';
import { startLoop } from './loop.ts';

export interface ServerOptions<R extends KitRoom> {
  name: string;
  makeRoom: () => R;
  distDir?: string;
  tickRate?: number;
  maxPayload?: number;
  emptyTtlMs?: number;
  args?: ServerArgs;
}

export interface RunningServer<R extends KitRoom> {
  port: number;
  rooms: Rooms<R>;
  close(): void;
}

interface WsUserData<R extends KitRoom> {
  conn: Conn | null;
  room: R | null;
  join: JoinRequest;
}

const MAX_BUFFERED = 512 * 1024;

export function startServer<R extends KitRoom>(opts: ServerOptions<R>): Promise<RunningServer<R>> {
  const args = opts.args ?? parseArgs();
  const tickRate = opts.tickRate ?? 60;
  const maxPayload = opts.maxPayload ?? 16384;
  const emptyTtlMs = opts.emptyTtlMs ?? 60000;

  const rooms = new Rooms(opts.makeRoom, emptyTtlMs);
  const app = uWS.App();

  app.ws<WsUserData<R>>('/ws', {
    compression: uWS.DISABLED,
    maxPayloadLength: maxPayload,
    idleTimeout: 30,
    sendPingsAutomatically: true,
    upgrade: (res, req, ctx) => {
      const q = new URLSearchParams(req.getQuery() ?? '');
      res.upgrade(
        { conn: null, room: null, join: parseJoin(q) },
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        ctx,
      );
    },
    open: (ws) => {
      const d = ws.getUserData();
      let closed = false;
      d.conn = {
        send: (data: Uint8Array | string) => {
          if (closed) return;
          if (ws.getBufferedAmount() > MAX_BUFFERED) {
            closed = true;
            ws.end(1011, 'too slow');
            return;
          }
          if (typeof data === 'string') {
            ws.send(data, false);
          } else {
            ws.send(data, true);
          }
        },
        close: () => {
          if (!closed) {
            closed = true;
            ws.end(1000);
          }
        },
      };
      const r = rooms.resolve(d.join);
      if (!r.ok) {
        d.conn = null;
        closed = true;
        ws.end(REJECT_CODES[r.reason], r.reason);
        return;
      }
      d.room = r.entry.room;
      r.entry.room.connect(d.conn);
    },
    message: (ws, message, isBinary) => {
      const d = ws.getUserData();
      if (!d.room || !d.conn) return;
      if (isBinary) {
        d.room.receive(d.conn, new Uint8Array(message.slice(0)));
      } else {
        d.room.receive(d.conn, Buffer.from(message).toString('utf8'));
      }
    },
    close: (ws) => {
      const d = ws.getUserData();
      if (d.conn && d.room) {
        d.room.disconnect(d.conn);
      }
      d.room = null;
      d.conn = null;
    },
  });

  app.get('/api/rooms', (res) => {
    res.writeHeader('Content-Type', 'application/json').end(JSON.stringify(rooms.stats()));
  });

  const files = loadStaticFiles(args.noStatic ? null : (opts.distDir ?? null));

  app.get('/*', (res, req) => {
    let url = req.getUrl();
    if (url.endsWith('/')) url += 'index.html';
    const f = files.get(url) ?? (extname(url) ? undefined : files.get('/index.html'));
    if (!f) {
      res.writeStatus('404 Not Found').end('Not found');
      return;
    }
    const gzip = f.gz && /\bgzip\b/.test(req.getHeader('accept-encoding'));
    if (!f.immutable && req.getHeader('if-none-match') === f.etag) {
      res.cork(() => {
        res.writeStatus('304 Not Modified').writeHeader('ETag', f.etag).end();
      });
      return;
    }
    res.cork(() => {
      if (!f.immutable) res.writeHeader('ETag', f.etag);
      res.writeHeader('Content-Type', f.type);
      res.writeHeader('Cache-Control', f.immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
      if (gzip) res.writeHeader('Content-Encoding', 'gzip');
      res.end(gzip ? f.gz! : f.raw);
    });
  });

  return new Promise<RunningServer<R>>((resolve, reject) => {
    app.listen(args.host, args.port, (sock) => {
      if (!sock) {
        reject(new Error(`Port ${args.port} is busy.`));
        return;
      }
      const actualPort = uWS.us_socket_local_port(sock);
      const url = `http://localhost:${actualPort}/`;
      console.log(`${opts.name} server on ${url}`);

      if (args.host !== '127.0.0.1') {
        const lan: string[] = [];
        for (const list of Object.values(networkInterfaces())) {
          for (const a of list ?? []) {
            if (a.family === 'IPv4' && !a.internal) lan.push(`http://${a.address}:${actualPort}/`);
          }
        }
        if (lan.length) console.log('LAN players join at\n  ' + lan.join('\n  '));
      }

      if (args.open) {
        exec(
          process.platform === 'win32'
            ? `start "" "${url}"`
            : process.platform === 'darwin'
            ? `open "${url}"`
            : `xdg-open "${url}"`,
        );
      }

      const stopLoop = startLoop(() => rooms.tickAll(), tickRate);

      resolve({
        port: actualPort,
        rooms,
        close: () => {
          stopLoop();
          uWS.us_listen_socket_close(sock);
        },
      });
    });
  });
}
