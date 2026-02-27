import { NextResponse } from 'next/server'
import connectDB from '@/lib/databaseConnection'
import ManualOrder from '@/models/ManualOrder.model'

export async function GET(req, { params }) {
  try {
    await connectDB()

    const order = await ManualOrder.findOne({
      order_id: params.order_id,
    }).lean()

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: order })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch' },
      { status: 500 }
    )
  }
}