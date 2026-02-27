import { NextResponse } from 'next/server'
import connectDB from '@/lib/databaseConnection'
import ManualOrder from '@/models/ManualOrder.model'

/* =========================
   SOFT DELETE (TRASH)
   ========================= */
export async function PUT(req) {
  try {
    await connectDB()

    const { ids, deleteType } = await req.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty id list' },
        { status: 400 }
      )
    }

    if (deleteType !== 'SD') {
      return NextResponse.json(
        { success: false, message: 'Invalid delete type for PUT' },
        { status: 400 }
      )
    }

    const result = await ManualOrder.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedAt: new Date() } }
    )

    return NextResponse.json({
      success: true,
      message: 'Manual order moved to trash',
      data: result,
    })
  } catch (error) {
    console.error('SOFT DELETE MANUAL ORDER ❌', error)
    return NextResponse.json(
      { success: false, message: 'Soft delete failed' },
      { status: 500 }
    )
  }
}

/* =========================
   PERMANENT DELETE
   ========================= */
export async function DELETE(req) {
  try {
    await connectDB()

    const { ids, deleteType } = await req.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty id list' },
        { status: 400 }
      )
    }

    if (deleteType !== 'PD') {
      return NextResponse.json(
        { success: false, message: 'Invalid delete type for DELETE' },
        { status: 400 }
      )
    }

    await ManualOrder.deleteMany({ _id: { $in: ids } })

    return NextResponse.json({
      success: true,
      message: 'Manual order deleted permanently',
    })
  } catch (error) {
    console.error('PERMANENT DELETE MANUAL ORDER ❌', error)
    return NextResponse.json(
      { success: false, message: 'Permanent delete failed' },
      { status: 500 }
    )
  }
}