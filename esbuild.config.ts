import { build } from 'esbuild'
import { dtsPlugin } from 'esbuild-plugin-d.ts'
;
(async () => {
  console.log(process.env.NODE_ENV)
  const watcher = process.argv.includes('-w')
  const builder = await build({
    outdir: 'dist',
    bundle: true,
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    platform: 'node',
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      )
    },
    tsconfig: './tsconfig.json',
    entryPoints: ['src/index.ts'],
    plugins: [dtsPlugin()]
  }).catch(() => process.exit(1))

  if (process.env.NODE_ENV === 'production') {
    console.log('🎊 App has build 🎉')
    process.exit()
  }
})()
