// src/app/api/logging/route.ts - Server-side logging API
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger'; // استخدام Server Logger الأصلي

export async function POST(_request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, context, stack, _timestamp } = body;

    // استخدام Server Logger للكتابة في ملفات وقاعدة البيانات
    switch (level) {
      case 'ERROR':
        await logger.error(message, context, stack ? new Error(stack) : undefined);
        break;
      case 'WARN':
        await logger.warn(message, context);
        break;
      default:
        await logger.info(message, context);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}


