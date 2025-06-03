import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إضافة البيانات التجريبية...')

  // إضافة الخدمات
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'قص شعر',
        nameAr: 'قص شعر',
        nameEn: 'Hair Cut',
        nameTr: 'Saç Kesimi',
        category: 'hair',
        price: 150.00,
        duration: 45,
        displayOrder: 1
      },
      {
        name: 'صبغة شعر',
        nameAr: 'صبغة شعر', 
        nameEn: 'Hair Color',
        nameTr: 'Saç Boyama',
        category: 'hair',
        price: 350.00,
        duration: 120,
        displayOrder: 2
      },
      {
        name: 'مكياج',
        nameAr: 'مكياج',
        nameEn: 'Makeup',
        nameTr: 'Makyaj',
        category: 'makeup',
        price: 200.00,
        duration: 60,
        displayOrder: 3
      },
      {
        name: 'تسريحة',
        nameAr: 'تسريحة',
        nameEn: 'Hair Styling',
        nameTr: 'Saç Şekillendirme',
        category: 'hair',
        price: 120.00,
        duration: 30,
        displayOrder: 4
      },
      {
        name: 'بدكير منكير',
        nameAr: 'بدكير منكير',
        nameEn: 'Pedicure Manicure',
        nameTr: 'Pedikür Manikür',
        category: 'nails',
        price: 100.00,
        duration: 90,
        displayOrder: 5
      }
    ]
  })

  // إضافة العملاء التجريبيين
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'سارة أحمد',
        phone: '+905551234567',
        totalVisits: 3,
        language: 'ar'
      },
      {
        name: 'فاطمة محمد',
        phone: '+905557654321',
        totalVisits: 1,
        language: 'ar'
      },
      {
        name: 'ليلى عبدالله',
        phone: '+905559876543',
        totalVisits: 8,
        language: 'ar'
      }
    ]
  })

  // إضافة الإعدادات الأساسية
  const settings = await prisma.setting.createMany({
    data: [
      {
        settingKey: 'working_hours_start',
        settingValue: '09:00',
        description: 'بداية ساعات العمل',
        category: 'schedule'
      },
      {
        settingKey: 'working_hours_end', 
        settingValue: '20:00',
        description: 'نهاية ساعات العمل',
        category: 'schedule'
      },
      {
        settingKey: 'slot_duration',
        settingValue: '30',
        description: 'مدة كل موعد بالدقائق',
        category: 'schedule'
      },
      {
        settingKey: 'loyalty_level_1',
        settingValue: '5',
        description: 'الزيارة رقم 5 للمستوى الأول',
        category: 'loyalty'
      },
      {
        settingKey: 'loyalty_level_2',
        settingValue: '10', 
        description: 'الزيارة رقم 10 للمستوى الثاني',
        category: 'loyalty'
      },
      {
        settingKey: 'loyalty_level_3',
        settingValue: '50',
        description: 'الزيارة رقم 50 للمستوى الثالث',
        category: 'loyalty'
      }
    ]
  })

  console.log('✅ تم إضافة البيانات التجريبية بنجاح!')
  console.log(`📦 الخدمات: ${services.count} خدمة`)
  console.log(`👥 العملاء: ${customers.count} عميل`)
  console.log(`⚙️ الإعدادات: ${settings.count} إعداد`)
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إضافة البيانات:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })