// Builds ../logical-space-demo.html: one self-contained file with real Motion Canvas scenes.
// It only READS the Motion Canvas packages of another project; it builds in a temp folder
// so nothing is written into that project or into this repository except the final HTML.
// Usage: node build.mjs [path-to-node_modules]
import {cpSync, mkdtempSync, readFileSync, writeFileSync, symlinkSync, unlinkSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const modules = resolve(process.argv[2] ?? 'D:/Projects/MotionCanvas/my-animation/node_modules');
const work = mkdtempSync(join(tmpdir(), 'sandworm-demo-'));
const link = join(work, 'node_modules');

cpSync(join(here, 'src'), join(work, 'src'), {recursive: true});
writeFileSync(join(work, 'package.json'), '{"type":"commonjs"}');
symlinkSync(modules, link, 'junction');

try {
  const {build} = await import(pathToFileURL(join(modules, 'vite/dist/node/index.js')).href);
  const {createRequire} = await import('node:module');
  const require = createRequire(join(work, 'package.json'));
  const mc = require('@motion-canvas/vite-plugin');
  const motionCanvas = mc.default ?? mc;
  process.chdir(work);
  await build({
    root: work,
    configFile: false,
    logLevel: 'warn',
    cacheDir: join(work, '.cache'),
    define: {'process.env.NODE_ENV': '"production"'},
    plugins: [
      motionCanvas({project: ['./src/projects/engine.ts', './src/projects/pit.ts', './src/projects/shake.ts']}),
      // The Motion Canvas plugin makes each project an entry; we want one page entry instead.
      {name: 'single-entry', configResolved(c) { c.build.rollupOptions.input = join(work, 'src/main.ts'); }},
    ],
    build: {
      outDir: join(work, 'out'),
      assetsInlineLimit: 100_000_000,
      modulePreload: false,
      rollupOptions: {
        preserveEntrySignatures: false,
        output: {format: 'iife', inlineDynamicImports: true, entryFileNames: 'app.js'},
      },
    },
  });
  const js = readFileSync(join(work, 'out/app.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
  const css = readFileSync(join(here, 'src/page.css'), 'utf8');
  const html = readFileSync(join(here, 'src/page.html'), 'utf8')
    .replace('/*CSS*/', () => css)
    .replace('/*JS*/', () => js);
  const out = join(here, '..', 'logical-space-demo.html');
  writeFileSync(out, html);
  console.log(`built ${out} (${Math.round(html.length / 1024)} KB)`);
} finally {
  process.chdir(here);
  unlinkSync(link); // remove the junction itself first, never its target
  rmSync(work, {recursive: true, force: true});
}
