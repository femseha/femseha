// مدخل اختبار العرض (SSR) — يُستخدم من scripts/ssr-verify.mjs فقط
import { renderToPipeableStream } from 'react-dom/server';
import { Writable } from 'node:stream';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

export async function renderRoute(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let renderError: unknown;
    const chunks: Buffer[] = [];
    const stream = renderToPipeableStream(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
      {
        onAllReady() {
          if (renderError) return reject(renderError);
          const output = new Writable({
            write(chunk, _encoding, callback) {
              chunks.push(Buffer.from(chunk));
              callback();
            }
          });
          output.once('error', reject);
          output.once('finish', () => resolve(Buffer.concat(chunks).toString('utf8')));
          stream.pipe(output);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          renderError ||= error;
        }
      }
    );
  });
}
