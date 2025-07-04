// ======================================
// فهرس مكونات واجهة المستخدم - محدث
// ======================================

// المكونات الأساسية
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as PhoneMenu } from './PhoneMenu';
export { default as CombinedHeader, useViewMode } from './CombinedHeader';

// المكونات القديمة (للتوافق مع الكود الموجود)
export { default as ViewToggleButtons } from './ViewToggleButtons';

// ====== ملاحظات التطوير ======
//
// المكونات الجديدة:
// ✅ CombinedHeader - هيدر مدمج يجمع أزرار التبديل + تنقل التاريخ
// ✅ useViewMode - Hook محدث بدون عرض القائمة
//
// التحديثات:
// - CombinedHeader يحل محل CalendarHeader + ViewToggleButtons
// - useViewMode يدعم فقط: month, week, day
// - تصميم مدمج بذكاء: [عروض] | [تاريخ] | [تنقل]
//
// المكونات المحتفظ بها:
// - ViewToggleButtons (للتوافق مع الكود القديم)
// - LoadingSpinner (مكون أساسي)
// - PhoneMenu (مكون تفاعلي)
