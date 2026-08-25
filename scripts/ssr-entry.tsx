// مدخل اختبار العرض (SSR) — يُستخدم من scripts/ssr-verify.mjs فقط
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

export function renderRoute(path: string): string {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}
