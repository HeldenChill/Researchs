import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('protocol-sync', () => {
  it('relay-protocol in server matches protocol in net', () => {
    const serverProtoPath = resolve(__dirname, '../../server/src/relay-protocol.ts');
    const netProtoPath = resolve(__dirname, '../src/protocol.ts');

    const serverContent = readFileSync(serverProtoPath, 'utf8');
    const netContent = readFileSync(netProtoPath, 'utf8');

    // Strip parseRelayClientMsg function from server protocol and any comments
    const stripFn = (s: string) => {
      const fnIdx = s.indexOf('export function parseRelayClientMsg');
      const typesPart = fnIdx >= 0 ? s.slice(0, fnIdx) : s;
      return typesPart.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
    };

    expect(stripFn(serverContent)).toBe(stripFn(netContent));
  });
});
