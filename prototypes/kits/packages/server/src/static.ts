import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

export interface StaticFile {
  type: string;
  raw: Buffer;
  gz: Buffer | null;
  immutable: boolean;
  etag: string;
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
};

export function loadStaticFiles(distDir: string | null): Map<string, StaticFile> {
  const files = new Map<string, StaticFile>();
  if (!distDir) return files;

  const walk = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      const type = TYPES[extname(f).toLowerCase()] ?? 'application/octet-stream';
      const raw = readFileSync(p);
      const gz =
        /text|javascript|json|svg|wasm/.test(type) && raw.length > 1024
          ? gzipSync(raw)
          : null;
      const etag =
        '"' +
        createHash('sha1')
          .update(raw)
          .digest('base64url')
          .slice(0, 20) +
        '"';
      const rel = '/' + p.slice(distDir.length + 1).replace(/\\/g, '/');
      files.set(rel, { type, raw, gz, immutable: rel.startsWith('/assets/'), etag });
    }
  };

  try {
    walk(distDir);
  } catch {
    console.warn(
      `No client build at ${distDir} (run \`npm run build\`). Serving the WebSocket only.`,
    );
  }

  return files;
}
