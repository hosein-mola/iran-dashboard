import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getReservoirPage } from '@/lib/reservoir-data'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().min(10).max(100).optional(),
  objectId: z.coerce.number().int().positive().optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parsed = querySchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    )

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'پارامترهای فیلتر داده معتبر نیستند.' },
        { status: 400 }
      )
    }

    return NextResponse.json(await getReservoirPage(parsed.data))
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'خطا در خواندن داده‌های مخازن.',
      },
      { status: 500 }
    )
  }
}
