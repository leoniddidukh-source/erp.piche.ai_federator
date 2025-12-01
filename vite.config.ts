/// <reference types="vitest" />

import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import VitePluginHtmlEnv from 'vite-plugin-html-env';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'REACT_APP_']);

  // Build object with REACT_APP_ variables for import.meta.env
  const reactAppEnv: Record<string, string> = {};
  Object.keys(env).forEach(key => {
    if (key.startsWith('REACT_APP_')) {
      reactAppEnv[key] = env[key];
    }
  });

  return defineConfig({
    define: {
      'process.env': '"' + env.VITE_ENV + '"',
      // Expose REACT_APP_ prefixed environment variables to import.meta.env
      ...Object.keys(reactAppEnv).reduce(
        (acc, key) => {
          acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);

          return acc;
        },
        {} as Record<string, string>
      ),
    },

    plugins: [
      react(),

      cssInjectedByJsPlugin(),

      VitePluginHtmlEnv({
        compiler: true,
      }),
    ],

    build: {
      lib: {
        formats: ['es', 'umd'],

        entry: resolve(__dirname, 'index.ts'),

        name: 'piche.wc.react-app-template',

        fileName: format => {
          if (format == 'es') {
            return 'index.js';
          }

          return `index.${format}.js`;
        },
      },

      rollupOptions: {
        external: ['react', 'react-dom'],

        output: {
          globals: {
            react: 'React',

            'react-dom': 'ReactDOM',
          },
        },
      },
    },

    test: {
      globals: true,

      environment: 'happy-dom',

      setupFiles: ['src/setupTest.ts'],
    },
  });
};
