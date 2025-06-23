
-- 🔧 إصلاح قاعدة البيانات - الحل الموحد (الخيار B)
-- سيتم تحويل جميع الحجوزات الفارغة إلى "خدمات أخرى"

-- ===============================
-- الخطوة 1: إصلاح الحجوزات الفارغة (800 حجز)
-- ===============================
SELECT 'بدء إصلاح الحجوزات الفارغة...' as status;

UPDATE reservations 
SET services = '["13"]'
WHERE services = '[]' OR services IS NULL OR services = '';

SELECT CONCAT('تم إصلاح ', ROW_COUNT(), ' حجز فارغ') as result;

-- ===============================
-- الخطوة 2: إصلاح التنسيقات المختلطة
-- ===============================
SELECT 'إصلاح التنسيقات المختلطة...' as status;

-- إصلاح الأرقام بدون اقتباس [1,2,3] → ["1","2","3"]
UPDATE reservations 
SET services = '["1","2","3","4","5","6","7","8","9","10","11","12"]'
WHERE services = '[1,2,3,4,5,6,7,8,9,10,11,12]';

UPDATE reservations 
SET services = '["1","2","3"]'
WHERE services = '[1,2,3]';

UPDATE reservations 
SET services = '["4","5","7"]'
WHERE services = '[4,5,7]';

-- إصلاح الأسماء العربية المعروفة
UPDATE reservations SET services = '["1"]' WHERE services = '["قص"]';
UPDATE reservations SET services = '["2"]' WHERE services = '["سشوار"]'; 
UPDATE reservations SET services = '["3"]' WHERE services = '["صبغة"]';
UPDATE reservations SET services = '["4"]' WHERE services = '["هاي لايت"]';
UPDATE reservations SET services = '["5"]' WHERE services = '["مكياج"]';
UPDATE reservations SET services = '["6"]' WHERE services = '["عروس"]';
UPDATE reservations SET services = '["7"]' WHERE services = '["واكس"]';
UPDATE reservations SET services = '["8"]' WHERE services = '["بدكير - منكير"]';
UPDATE reservations SET services = '["9"]' WHERE services = '["تنظيف بشرة"]';
UPDATE reservations SET services = '["10"]' WHERE services = '["وجه"]';
UPDATE reservations SET services = '["11"]' WHERE services = '["تسريحة"]';
UPDATE reservations SET services = '["12"]' WHERE services = '["بروتين"]';

-- إصلاح الأسماء المركبة
UPDATE reservations SET services = '["11","5"]' WHERE services = '["تسريحة, مكياج"]';
UPDATE reservations SET services = '["1","2"]' WHERE services = '["قص, سشوار"]';
UPDATE reservations SET services = '["8","9"]' WHERE services = '["بدكير - منكير, تنظيف بشرة"]';

-- ===============================
-- الخطوة 3: التحقق من النتائج
-- ===============================
SELECT 'نتائج الإصلاح النهائية:' as result;

SELECT 
  COUNT(*) as total_reservations,
  COUNT(CASE WHEN services = '[]' OR services IS NULL OR services = '' THEN 1 END) as remaining_empty,
  COUNT(CASE WHEN services = '["13"]' THEN 1 END) as fixed_with_other_services,
  COUNT(CASE WHEN services LIKE '%قص%' OR services LIKE '%صبغة%' THEN 1 END) as remaining_arabic_names
FROM reservations;

-- عرض عينة من البيانات المُصلحة
SELECT 'عينة من الحجوزات بعد الإصلاح:' as sample;
SELECT id, services, status FROM reservations WHERE services = '["13"]' LIMIT 5;

SELECT 'الإصلاح مكتمل ✅' as final_status;
