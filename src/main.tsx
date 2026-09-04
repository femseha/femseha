import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const container = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// عند وجود HTML مُسبق التوليد (scripts/prerender.mjs بعد البناء) نستخدم
// hydrate حتى لا يُعاد رسم المحتوى من الصفر؛ في التطوير (بلا محتوى مسبق)
// نستخدم createRoot كالمعتاد.
if (container.hasChildNodes() && container.dataset.prerendered === 'true') {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
