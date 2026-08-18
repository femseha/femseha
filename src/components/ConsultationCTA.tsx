import React from 'react';
import { DOCTOR, CLINIC_PHONE, WHATSAPP_LINK } from '../data/site';

export function PhoneButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={`tel:${CLINIC_PHONE || '00966599287172'}`}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-sm text-sm ${className}`}
    >
      <span>📞</span>
      <span>اتصال بالعيادة</span>
    </a>
  );
}

export function WhatsAppButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={WHATSAPP_LINK || `https://wa.me/966599287172`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm text-sm ${className}`}
    >
      <span>💬</span>
      <span>استشارة واتساب</span>
    </a>
  );
}

export function ConsultationCTA() {
  return (
    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-3xl p-6 sm:p-8 text-center my-8">
      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
        هل تحتاجين إلى استشارة طبية مباشرة؟
      </h3>
      <p className="text-slate-600 mb-6 max-w-xl mx-auto text-sm sm:text-base">
        تواصلي مباشرة مع {DOCTOR?.name || 'د. هيثم الخطيب'} للحصول على تشخيص سريري دقيق وخطة متابعة متكاملة.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <WhatsAppButton />
        <PhoneButton />
      </div>
    </div>
  );
}

export default ConsultationCTA;
