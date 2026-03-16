import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { 'zkrune-widget': 'src/index.ts' },
    format: ['iife'],
    globalName: 'ZkRuneWidget',
    platform: 'browser',
    minify: true,
    clean: true,
    outDir: 'dist',
  },
  {
    entry: { 'zkrune-widget': 'src/index.ts' },
    format: ['esm'],
    dts: true,
    platform: 'browser',
    outDir: 'dist',
  },
]);
