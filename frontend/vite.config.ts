import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import inject from '@rollup/plugin-inject';
import tsconfigPaths from 'vite-tsconfig-paths';

export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  console.log("Loaded ENV:", process.env.VITE_BACKEND_HOST, process.env.VITE_BACKEND_PORT);

  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [react(), tsconfigPaths()],
    server: {
      allowedHosts: true,
    },
    preview: {
      host: true,
      port: Number(process.env.VITE_FRONTEND_PORT || 3001),
    },
    ...(mode === 'production' && {
      resolve: {
        alias: {
          '@': '/src',
          crypto: 'crypto-browserify',
        },
      },
      build: {
        rollupOptions: {
          plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
        },
      },
    }),
  });
};
