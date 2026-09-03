
import { Link } from 'react-router-dom';
import { SITE } from '../data/site';
import { useSeo, websiteJsonLd } from '../lib/seo';

export default function DisclaimerPage() {
  useSeo({
    title: 'إخلاء المسؤولية الطبية | منصة فصيحة الطبية',
    description:
      'إخلاء المسؤولية الطبية لمنصة فصيحة: المحتوى تثقيفي عام بإشراف د. هيثم الخطيب ولا يغني عن التقييم الطبي المباشر.',
    canonicalPath: '/medical-disclaimer',
    jsonLd: [websiteJsonLd()]
  });

  return (
    <div className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <nav aria-label="مسار التنقل" className="text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-sky-400">الرئيسية</Link>
          <span className="mx-2">‹</span>
          <span className="text-slate-300 font-semibold">إخلاء المسؤولية الطبية</span>
        </nav>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg p-8 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">إخلاء المسؤولية الطبية</h1>

          <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-loose">
            <p>
              المحتوى المنشور في «{SITE.name}» ذو طابع تثقيفي وتوعوي عام، بإشراف {SITE.author}،
              وهو مُعد لتزيد به القارئة وعياً الصحياً لا لتشخيص حالتها أو علاجها ذاتياً.
            </p>
            <p>
              <strong className="text-white">لا يُغني المحتوى عن الطبيب:</strong> المعلومات العامة لا
              تراعي خصوصيات الحالات الفردية (العمر، التاريخ المرضي، الأدوية، الحمل). القرار العلاجي لا
              يتخذ إلا بعد تقييم طبي مباشر يشمل الفحص والفحوصات اللازمة.
            </p>
            <p>
              <strong className="text-white">لا نبيع الأدوية:</strong> منصة فصيحة منصة توعوية
              واستشارية فقط، ولا تبيع أو تداول أي منتجات دوائية، ولا تعرض أسعاراً أو طرق شراء أو توصيل،
              ولا تقدم جرعات أو بروتوكولات علاجية فردية.
            </p>
            <p>
              <strong className="text-white">الحالات الطارئة:</strong> لا تنتظري رداً عبر الإنترنت عند
              علامات الخطر (نزيف غزير، ألم بطن شديد أو مفاجئ، دوخة أو إغماء، ضيق تنفس، حمى مرتفعة
              مستمرة)؛ توجهي فوراً إلى أقرب قسم طوارئ.
            </p>
            <p>
              <strong className="text-white">حدود المسؤولية:</strong> تُبذل العناية اللازمة لدقة
              المحتوى وموثوقيته وربطه بمصادر طبية معتمدة حيثما أمكن، لكن المنصة لا تتحمل مسؤولية أي
              تصرف يتخذ بناءً على المحتوى دون استشارة مختص.
            </p>
            <p>
              للاستشارة المباشرة يمكنك التواصل مع {SITE.author} عبر الأرقام المعلنة في صفحة{' '}
              <Link to="/consultation" className="text-sky-400 font-semibold hover:underline">
                الاستشارة الطبية
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
