import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ isSsrBuild }) => {
  const useServerEntries = isSsrBuild === true || process.env.VITE_SSR_VERIFY === 'true';

  return ({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext'
  },
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
        find: '@entry/DoctorPage',
        replacement: fileURLToPath(new URL('./src/pages/DoctorPageEntry.tsx', import.meta.url))
      },
      {
        find: '@entry/ConsultationPage',
        replacement: fileURLToPath(new URL('./src/pages/ConsultationPageEntry.tsx', import.meta.url))
      },
      {
        find: '@entry/DisclaimerPage',
        replacement: fileURLToPath(new URL('./src/pages/DisclaimerPageEntry.tsx', import.meta.url))
      },
      {
        find: '@entry/NotFoundPage',
        replacement: fileURLToPath(new URL('./src/pages/NotFoundPageEntry.tsx', import.meta.url))
      },
      {
        find: '@entry/ClusterPage',
        replacement: fileURLToPath(new URL('./src/pages/ClusterPageEntry.tsx', import.meta.url))
      },
      {
        find: '@entry/PregnancyCalculatorPage',
        replacement: fileURLToPath(new URL('./src/pages/PregnancyCalculatorPageEntry.tsx', import.meta.url))
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  }
  });
});
