# Kits

Shared packages and toolkits for demos.

## Put a demo online

Add `@hk/server` to `packages/server` and `@hk/net` to `packages/client`.

### Server (`packages/server/src/server.ts`)

```ts
import { resolve } from 'node:path';
import { startServer, relayRoom } from '@hk/server';

startServer({
  name: 'MyDemo',
  makeRoom: () => relayRoom({ maxPlayers: 8 }),
  distDir: resolve(__dirname, '../../client/dist'),
}).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
```

To customize room logic, implement `KitRoom` (like FishingGame) or supply `RelayHooks` (`canClaim`, `group`, `canState`, `validateState`, `onRelease`).

### Client (`packages/client/src/main.ts`)

```ts
import { RelayClient, wsUrl } from '@hk/net';

const client = new RelayClient(wsUrl(), {
  onWelcome(id) {
    client.claim('avatar:0');
  },
  onState(from, obj, data) {
    // apply peer state update
  },
});

// Broadcast local state for an owned object
client.state('avatar:0', { x: 10, y: 0, z: 5 });
```

### Server build (`build.mjs`)

Keep uWebSockets.js external:

```js
import esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  outfile: 'dist/server.cjs',
  external: ['uWebSockets.js'],
});
```

### Running

```sh
node packages/server/dist/server.cjs --open
```
