import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// صفحات مؤقتة آمنة لضمان عمل الموقع فوراً
function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">منصة فصيحة الطبية</h1>
        <p className="text-slate-600 mb-6">الموقع قيد التحديث والصيانة الدورية لتقديم أفضل خدمة طبية.</p>
        <a href="/admin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
          تسجيل الدخول للوحة التحكم
        </a>
      </div>
    </div>
  );
}

import { Admin } from './pages/Admin';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
