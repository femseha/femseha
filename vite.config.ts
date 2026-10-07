import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ isSsrBuild }) => {
  const useServerEntries = isSsrBuild === true || process.env.VITE_SSR_VERIFY === 'true';

  return ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: '@entry/ArticlesPage',
        replacement: fileURLToPath(new URL(useServerEntries ? './src/pages/ArticlesPageEntryServer.tsx' : './src/pages/ArticlesPageEntryClient.tsx', import.meta.url))
      },
      {
        find: '@entry/ArticleView',
        replacement: fileURLToPath(new URL(useServerEntries ? './src/pages/ArticleViewEntryServer.tsx' : './src/pages/ArticleViewEntryClient.tsx', import.meta.url))
      },
      {
        find: '@entry/AdminPage',
        replacement: fileURLToPath(new URL(useServerEntries ? './src/pages/AdminPageEntryServer.tsx' : './src/pages/AdminPageEntryClient.tsx', import.meta.url))
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  }
  });
});
