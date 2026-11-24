// مدخل اختبار العرض (SSR) — يُستخدم من scripts/ssr-verify.mjs فقط
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

export function renderRoute(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on('data', (chunk: Buffer) => chunks.push(chunk));
    output.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    output.on('error', reject);
    const stream = renderToPipeableStream(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
      {
        onAllReady() { stream.pipe(output); },
        onShellError(error) { reject(error); },
        onError(error) { console.error('SSR verification render error:', error); }
      }
    );
  });
}
