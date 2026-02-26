import { NextResponse } from 'next/server'
import connectDB from '@/lib/databaseConnection'
import ManualOrder from '@/models/ManualOrder.model'

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()

    const qty = Number(body.qty || 1)
    const price = Number(body.price || 0)

    if (!body.name || !body.phone || !body.productName || !body.category) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const subtotal = qty * price

    const order = await ManualOrder.create({
      order_id: `MANUAL-${Date.now()}`,

      name: body.name,
      email: body.email || '',
      phone: body.phone,
      address: body.address,

      products: [
        {
          name: body.productName,
          category: body.category,
          qty,
          price,
        },
      ],

      subtotal,
      totalAmount: subtotal,
    })

    return NextResponse.json({
      success: true,
      message: 'Manual order created successfully',
      data: order,
    })
  } catch (error) {
    console.error('MANUAL ORDER ERROR ❌', error)

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}