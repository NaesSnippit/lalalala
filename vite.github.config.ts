import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));

// Relative paths work on both username.github.io and username.github.io/repo/.
export default defineConfig({
  root:path.join(directory,'github'),
  base:'./',
  publicDir:path.join(directory,'public'),
  plugins:[react()],
  resolve:{alias:{'@':directory}},
  css:{postcss:path.join(directory,'postcss.config.mjs')},
  build:{outDir:path.join(directory,'docs'),emptyOutDir:true},
});
