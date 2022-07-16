import { build } from 'esbuild';
(async () => {
  const builder = await build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    platform: 'node',
    format: 'esm',
    target: ['esnext']
  }).catch(() => process.exit(1))
  console.log('🎊 App has build 🎉')
})()
