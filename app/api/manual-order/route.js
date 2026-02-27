import { NextResponse } from 'next/server'
import connectDB from '@/lib/databaseConnection'
import ManualOrder from '@/models/ManualOrder.model'

/* ===================== GET ALL MANUAL ORDERS ===================== */
export async function GET() {
  try {
    await connectDB()

    const orders = await ManualOrder.find().sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('FETCH MANUAL ORDERS ERROR ❌', error)

    return NextResponse.json(
      { success: false, message: 'Failed to fetch manual orders' },
      { status: 500 }
    )
  }
}

/* ===================== CREATE MANUAL ORDER ===================== */
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()

    const {
      name,
      email,
      phone,
      address,
      productName,
      category,
      qty,
      price,
      media,
    } = body

    if (!name || !phone || !address || !productName || !category) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const quantity = Number(qty)
    const productPrice = Number(price)

    if (quantity <= 0 || productPrice < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid qty or price' },
        { status: 400 }
      )
    }

    const subtotal = quantity * productPrice

    const order = await ManualOrder.create({
      order_id: `MANUAL-${Date.now()}`,

      name,
      email: email || '',
      phone,
      address,

      products: [
        {
          name: productName,
          category,
          qty: quantity,
          price: productPrice,
          media: media || '',
        },
      ],

      subtotal,
      totalAmount: subtotal,
      status: 'pending',
      paymentStatus: 'Pending',
      orderType: 'MANUAL',
    })

    return NextResponse.json({
      success: true,
      message: 'Manual order created successfully',
      data: order,
    })
  } catch (error) {
    console.error('MANUAL ORDER CREATE ERROR ❌', error)

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}