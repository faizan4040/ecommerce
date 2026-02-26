import mongoose from 'mongoose'

const manualProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    qty: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
)

const manualOrderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },

    /* ---------- Customer ---------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },

    /* ---------- Order ---------- */
    products: [manualProductSchema],

    subtotal: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },

    orderType: {
      type: String,
      default: 'MANUAL',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.ManualOrder ||
  mongoose.model('ManualOrder', manualOrderSchema)