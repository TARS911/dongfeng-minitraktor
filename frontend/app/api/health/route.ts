import { NextResponse } from 'next/server';

// GET /api/health - проверка работы API
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
}
