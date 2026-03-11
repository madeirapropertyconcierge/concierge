export {};

const result = await Bun.build({
  entrypoints: ['./src/scripts/cms-admin.ts'],
  outdir: './public',
  naming: 'cms-admin.js',
  target: 'browser',
  format: 'esm',
  minify: false,
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log('Bundled CMS admin client to public/cms-admin.js');
