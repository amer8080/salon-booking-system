import Link from 'next/link';
import { Calendar, Clock, Sparkles, Star, Users, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  صالون ريم
                </h1>
                <p className="text-sm text-gray-500">جمالك هو اهتمامنا</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="text-gray-600 hover:text-gray-800 transition-colors">
                العربية
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              مرحباً بك في
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                صالون ريم للتجميل
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              اكتشفي عالماً من الجمال والأناقة مع خدماتنا المتميزة. احجزي موعدك الآن واستمتعي بتجربة
              فريدة من نوعها
            </p>
          </div>

          {/* Main CTA */}
          <div className="mb-16">
            <Link
              href="/book"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-6 h-6 ml-2" />
              احجزي موعدك الآن
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">5000+</h3>
              <p className="text-gray-600">عميلة سعيدة</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">4.9/5</h3>
              <p className="text-gray-600">تقييم العملاء</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">3+</h3>
              <p className="text-gray-600">سنوات من التميز</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 px-4 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">خدماتنا المميزة</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نقدم مجموعة شاملة من خدمات التجميل والعناية بأحدث التقنيات وأجود المنتجات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'قص وتصفيف الشعر',
                desc: 'احدث القصات العالمية مع خبراء التصفيف',
                price: 'من 150 ليرة',
                gradient: 'from-pink-400 to-rose-500',
              },
              {
                title: 'صبغ وتلوين',
                desc: 'ألوان عصرية وطبيعية بأجود الصبغات',
                price: 'من 350 ليرة',
                gradient: 'from-purple-400 to-indigo-500',
              },
              {
                title: 'مكياج ومناسبات',
                desc: 'مكياج احترافي لجميع المناسبات',
                price: 'من 200 ليرة',
                gradient: 'from-indigo-400 to-purple-500',
              },
              {
                title: 'تسريحات العرائس',
                desc: 'تسريحات فخمة ليوم العمر',
                price: 'من 500 ليرة',
                gradient: 'from-rose-400 to-pink-500',
              },
              {
                title: 'العناية بالأظافر',
                desc: 'مانيكير وبديكير بمنتجات عالمية',
                price: 'من 100 ليرة',
                gradient: 'from-purple-400 to-pink-500',
              },
              {
                title: 'علاجات البشرة',
                desc: 'عناية متكاملة لإشراق البشرة',
                price: 'من 250 ليرة',
                gradient: 'from-indigo-400 to-rose-500',
              },
            ].map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h4>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-lg font-semibold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}
                  >
                    {service.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/book"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105"
            >
              احجزي الآن
              <Clock className="w-5 h-5 mr-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">لماذا صالون ريم؟</h3>
            <p className="text-gray-600">نحن نضع جمالك وراحتك في المقدمة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Star,
                title: 'خبرة واحترافية',
                desc: 'فريق من أمهر خبراء التجميل',
              },
              {
                icon: Sparkles,
                title: 'منتجات عالمية',
                desc: 'نستخدم أجود المنتجات العالمية',
              },
              {
                icon: Clock,
                title: 'مواعيد مرنة',
                desc: 'نظام حجز سهل ومواعيد مناسبة',
              },
              {
                icon: Award,
                title: 'ضمان الجودة',
                desc: 'رضاك هو هدفنا الأول',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-4xl font-bold mb-6">جاهزة لتجربة فريدة؟</h3>
          <p className="text-xl mb-8 opacity-90">
            احجزي موعدك الآن واستمتعي بخدمات استثنائية في بيئة مريحة وأنيقة
          </p>
          <Link
            href="/book"
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 text-lg font-semibold rounded-full hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Calendar className="w-6 h-6 ml-2" />
            ابدئي رحلة الجمال
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">صالون ريم</h4>
              </div>
              <p className="text-gray-300">
                وجهتك المثالية للجمال والأناقة. نقدم أفضل خدمات التجميل بأحدث التقنيات.
              </p>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">ساعات العمل</h5>
              <div className="space-y-2 text-gray-300">
                <p>السبت - الخميس: 9:00 ص - 8:00 م</p>
                <p>الجمعة: مغلق</p>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">تواصلي معنا</h5>
              <div className="space-y-2 text-gray-300">
                <p>📍 إسطنبول، تركيا</p>
                <p>📞 +90 xxx xxx xxxx</p>
                <p>✉️ info@reemsalon.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 صالون ريم. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
