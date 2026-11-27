import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { fileURLToPath } from 'node:url';

const kits = fileURLToPath(new URL('../kits', import.meta.url));

export default defineConfig({
  resolve: {
    dedupe: ['three'],
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), kits],
    },
  },
  build: {
    outDir: 'dist',
  },
});
