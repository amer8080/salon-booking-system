import { PrismaClient } from '../generated/prisma';

// إنشاء Prisma Client مع إدارة الاتصالات
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// في بيئة التطوير، احفظ الـ client في global لتجنب إعادة الإنشاء
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// دالة لإغلاق الاتصال بشكل آمن
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// دالة للتحقق من الاتصال
export async function testConnection() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    return false;
  }
}
