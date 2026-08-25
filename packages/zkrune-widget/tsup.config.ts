import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // Script-tag build. This is the file the docs point at on the CDN, so its
    // name is part of the public contract — renaming it breaks every embed.
    entry: { 'zkrune-widget': 'src/index.ts' },
    format: ['iife'],
    globalName: 'ZkRuneWidget',
    platform: 'browser',
    minify: true,
    clean: true,
    outDir: 'dist',
  },
  {
    // Bundler builds. Both formats are declared in package.json, so both have
    // to exist: publishing with `main` pointing at a file tsup never wrote
    // leaves `require('zkrune-widget')` failing on a fresh install.
    entry: { 'zkrune-widget': 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    platform: 'browser',
    outDir: 'dist',
  },
]);
