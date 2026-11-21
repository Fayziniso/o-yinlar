import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          ageSelection: path.resolve(__dirname, 'age-selection.html'),
          registration: path.resolve(__dirname, 'registration.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          games: path.resolve(__dirname, 'games.html'),
          game: path.resolve(__dirname, 'game.html'),
          statistics: path.resolve(__dirname, 'statistics.html'),
          achievements: path.resolve(__dirname, 'achievements.html'),
          settings: path.resolve(__dirname, 'settings.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
