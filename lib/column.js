import dayjs from "dayjs";
import Chip from "@mui/material/Chip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

import { XCircle, AlertTriangle, CheckCircle, Flame } from "lucide-react"
import { IMAGES } from "@/routes/AllImages";
import { getSizeRow } from "@/lib/shoeSizes";


export const DT_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Category Name',
        Cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold uppercase text-orange-600">
              {String(row.original?.name || "?").slice(0, 1)}
            </span>
            <span className="font-semibold">{row.original?.name}</span>
          </div>
        ),
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
        Cell: ({ row }) => <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">/{row.original?.slug}</span>,
    },

]


export const DT_PRODUCT_COLUMN = [
  {
    id: "product",
    accessorKey: "name",
    header: "Product",
    size: 280,
    Cell: ({ row }) => {
      const o = row.original
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-linear-to-br from-amber-50 to-orange-100">
            <Image src={o?.image || IMAGES.image_placeholder} alt={o?.name || "Product"} fill sizes="56px" className="object-contain p-1 mix-blend-multiply" unoptimized />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{o?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{o?.brand ? `${o.brand} · ` : ""}/{o?.slug}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    Cell: ({ row }) =>
      row.original?.category ? (
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">{row.original.category}</span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    Cell: ({ row }) => <PriceCell mrp={row.original?.mrp} sp={row.original?.sellingPrice} discount={row.original?.discountPercentage} />,
  },
  {
    accessorKey: "variantCount",
    header: "Variants",
    enableSorting: false,
    Cell: ({ row }) => <span className="font-semibold">{row.original?.variantCount ?? 0}</span>,
  },
  {
    accessorKey: "totalStock",
    header: "Stock",
    enableSorting: false,
    Cell: ({ row }) => <StockBadge stock={row.original?.totalStock ?? 0} />,
  },
]


export const DT_PRODUCT_VARIANT_COLUMN = [
  {
    id: "product",
    accessorKey: "product",
    header: "Product",
    size: 260,
    Cell: ({ row }) => {
      const o = row.original
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-muted">
            <Image src={o?.image || IMAGES.image_placeholder} alt={o?.product || "Product"} fill sizes="48px" className="object-cover" unoptimized />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{o?.product || "—"}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{o?.sku}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "color",
    header: "Colour",
    Cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="h-5 w-5 shrink-0 rounded-full border shadow-inner" style={{ backgroundColor: row.original?.colorCode || "#e5e7eb" }} />
        <span className="font-medium">{row.original?.color}</span>
      </div>
    ),
  },
  {
    accessorKey: "size",
    header: "Size",
    Cell: ({ row }) => {
      const r = getSizeRow(row.original?.gender, row.original?.size)
      return (
        <div>
          <p className="font-bold">UK {r.uk}</p>
          <p className="text-[11px] text-muted-foreground">US {r.us} · EU {r.eu}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    Cell: ({ row }) => {
      const g = row.original?.gender
      const tone = g === "women" ? "bg-pink-50 text-pink-700" : g === "kids" ? "bg-sky-50 text-sky-700" : "bg-indigo-50 text-indigo-700"
      return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>{g}</span>
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    Cell: ({ row }) => <StockBadge stock={row.original?.stock ?? 0} />,
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    Cell: ({ row }) => <PriceCell mrp={row.original?.mrp} sp={row.original?.sellingPrice} discount={row.original?.discountPercentage} />,
  },
]

function PriceCell({ mrp, sp, discount }) {
  const fmt = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—")
  return (
    <div className="leading-tight">
      <p className="font-bold">{fmt(sp)}</p>
      {mrp > sp && (
        <p className="text-xs">
          <span className="text-muted-foreground line-through">{fmt(mrp)}</span>
          <span className="ml-1.5 font-semibold text-emerald-600">{Math.round(discount || 0)}% off</span>
        </p>
      )}
    </div>
  )
}

function StockBadge({ stock }) {
  const s = Number(stock) || 0
  const tone = s === 0 ? "bg-red-50 text-red-600" : s < 10 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
  const label = s === 0 ? "Out of stock" : s < 10 ? `Low · ${s}` : `${s} in stock`
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
}



export const DT_COUPON_COLUMN = [
    {
        accessorKey: 'code',
        header: 'Code',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'DiscountPercentage',
    },
    {
        accessorKey: 'minShoppingAmount',
        header: 'MinShoppingAmount',
    },
   

    {
    accessorKey: "validity",
    header: "Validity",
    Cell: ({ row }) => {
        const validity = row.original.validity;

        if (!validity) return null;

        const isExpired = dayjs(validity).isBefore(dayjs(), "day");

        return (
        <Chip
            label={dayjs(validity).format("DD MMM YYYY")}
            color={isExpired ? "error" : "success"}
            size="small"
        />
        );
    },
    }
]



export const DT_CUSTOMERS_COLUMN = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    Cell: ({ renderedCellValue }) => {
      const avatarUrl =
        typeof renderedCellValue === "string"
          ? renderedCellValue
          : renderedCellValue?.url;

      return (
        <Avatar>
          <AvatarImage
            src={avatarUrl || IMAGES.profile}
            onError={(e) => (e.currentTarget.src = IMAGES.profile)}
          />
        </Avatar>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'isEmailVerified',
    header: 'Is Verified',
    Cell: ({ renderedCellValue }) => (
      renderedCellValue ? (
        <Chip color="success" label="Verified" />
      ) : (
        <Chip color="error" label="Not Verified" />
      )
    ),
  },
];





export const DT_REVIEW_COLUMN = [
  {
    accessorFn: row => row.product?.name ?? 'N/A',
    header: 'Product',
  },
  {
    accessorFn: row => row.user?.name ?? 'N/A',
    header: 'User',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
  },
  {
    accessorKey: 'review',
    header: 'Review',
  },
];






/* ===================== HELPERS ===================== */
const normalizeStatus = (status) =>
  String(status || "pending").toLowerCase()

const ORDER_STATUS_MAP = {
  pending: {
    label: "Pending Payment",
    class: "bg-orange-100 text-orange-700",
  },
  processing: {
    label: "In Progress",
    class: "bg-gray-100 text-gray-700",
  },
  shipped: {
    label: "Order Shipped",
    class: "bg-blue-100 text-blue-700",
  },
  delivering: {
    label: "Order Delivering",
    class: "bg-yellow-100 text-yellow-700",
  },
  delivered: {
    label: "Delivered",
    class: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-100 text-red-700",
  },
  unverified: {
    label: "Unverified",
    class: "bg-purple-100 text-purple-700",
  },
}

export const DT_ORDER_COLUMN = [
  
  {
    id: "product",
    header: "Product",
    Cell: ({ row }) => {
      const product = row.original?.products?.[0]

      const rawImage =
        product?.variantId?.media?.[0]?.secure_url ||
        product?.variantId?.media?.[0]?.url ||
        product?.variantId?.media?.[0]?.path ||
        null

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""

      const finalImage =
        typeof rawImage === "string" && rawImage.trim()
          ? rawImage.startsWith("http")
            ? rawImage
            : `${apiUrl}${rawImage}`
          : IMAGES.image_placeholder

      return (
        <div className="flex items-center gap-3 min-w-55">
          <div className="relative w-14 h-14 shrink-0 rounded-md border bg-white overflow-hidden">
            <Image
              src={finalImage}
              alt={product?.productId?.name || "Product"}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {product?.productId?.name || "Product"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {product?.variantId?.sku || "SKU"}
            </span>
          </div>
        </div>
      )
    },
  },

  /* ===================== ORDER DATE ===================== */
  {
    accessorKey: "createdAt",
    header: "Order Date",
    Cell: ({ renderedCellValue }) => {
      if (!renderedCellValue) return "-"

      const date = new Date(renderedCellValue)

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {date.toLocaleDateString("en-IN")}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )
    },
  },

  /* ===================== IDS ===================== */
  { accessorKey: "order_id", header: "Order ID" },

  /* ===================== PAYMENT ===================== */
  {
    id: "payment",
    header: "Payment",
    Cell: ({ row }) => {
      const paymentId = row.original?.payment_id
      const paymentStatus = row.original?.paymentStatus

      let label = "Pending"
      let color = "bg-yellow-100 text-yellow-700"

      if (paymentStatus === "Failed") {
        label = "Failed"
        color = "bg-red-100 text-red-700"
      } else if (paymentId || paymentStatus === "Paid") {
        label = "Paid"
        color = "bg-green-100 text-green-700"
      }

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>
          {label}
        </span>
      )
    },
  },

  /* ===================== CUSTOMER ===================== */
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },

  /* ===================== LOCATION ===================== */
  { accessorKey: "country", header: "Country" },
  { accessorKey: "state", header: "State" },
  { accessorKey: "city", header: "City" },
  { accessorKey: "pincode", header: "Pincode" },

  /* ===================== ITEMS ===================== */
  {
    header: "Items",
    Cell: ({ row }) => row.original?.products?.length ?? 0,
  },

  /* ===================== PRICING ===================== */
  {
    accessorKey: "discount",
    header: "Discount",
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },
  {
    accessorKey: "couponDiscount",
    header: "Coupon",
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },

  /* ===================== ORDER STATUS ===================== */
  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ renderedCellValue }) => {
      const key = normalizeStatus(renderedCellValue)
      const status = ORDER_STATUS_MAP[key] || ORDER_STATUS_MAP.pending

      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${status.class}`}
        >
          {status.label}
        </span>
      )
    },
  },
]


export const DT_STOCK_COLUMN = [
  {
    header: "Product",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Image
          src={row.original.image || "/placeholder.png"}
          width={36}
          height={36}
          className="rounded-lg border"
          alt={row.original.productName || "Product"}
        />
        <div>
          <p className="font-medium">{row.original.productName}</p>
          <p className="text-xs text-muted-foreground">
            SKU: {row.original.sku}
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "totalSold",
    header: "Sold",
  },

  {
    accessorKey: "remainingStock",
    header: "Stock",
  },

  {
    header: "Status",
    Cell: ({ row }) => {
      const status = row.original.status

      if (status === "Out of Stock") {
        return (
          <span className="flex items-center gap-1 text-gray-500">
            <XCircle size={16} />
            Out of Stock
          </span>
        )
      }

      if (status === "Low Stock") {
        return (
          <span className="flex items-center gap-1 text-red-500 animate-pulse">
            <AlertTriangle size={16} />
            Low Stock
          </span>
        )
      }

      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle size={16} />
          In Stock
        </span>
      )
    },
  },

  {
    header: "Trending",
    Cell: ({ row }) =>
      row.original.totalSold > 50 ? (
        <span className="flex items-center gap-1 text-orange-500">
          <Flame size={16} />
          Most Sold
        </span>
      ) : (
        "—"
      ),
  },
]



export const DT_WAREHOUSE_COLUMN = [
  {
    accessorKey: 'name',
    header: 'Warehouse Name',
    size: 150,
  },
  {
    accessorKey: 'location',
    header: 'Location',
    size: 120,
  },
  {
    accessorKey: 'city',
    header: 'City',
    size: 100,
  },
  {
    accessorKey: 'manager',
    header: 'Manager',
    size: 120,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    size: 110,
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    size: 100,
    cell: ({ row }) => {
      const capacity = row.getValue('capacity')
      return <span className='font-semibold'>{capacity.toLocaleString()} units</span>
    },
  },
  {
    accessorKey: 'currentStock',
    header: 'Current Stock',
    size: 120,
    cell: ({ row }) => {
      const currentStock = row.getValue('currentStock')
      const capacity = row.original.capacity
      const percentage = ((currentStock / capacity) * 100).toFixed(2)
      
      return (
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>{currentStock.toLocaleString()}</span>
          <div className='w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
            <div 
              className='h-full bg-orange-500' 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <span className='text-xs text-gray-500'>{percentage}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: ({ row }) => {
      const status = row.getValue('status')
      const statusConfig = {
        'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
        'inactive': { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
        'maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance' },
      }
      
      const config = statusConfig[status] || statusConfig['inactive']
      
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    size: 110,
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
  },
]



export const DT_MANUAL_ORDER_COLUM = [
{
  id: 'product',
  header: 'Product',
  Cell: ({ row }) => {
    const product = row.original?.products?.[0]

    const image =
      typeof product?.media === 'string' && product.media.trim()
        ? product.media
        : IMAGES.image_placeholder

    return (
      <div className="flex items-center gap-3 min-w-55">
        <div className="relative w-14 h-14 rounded-md border overflow-hidden">
          <Image
            src={image}
            alt={product?.name || 'Product'}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-medium">{product?.name}</p>
          <p className="text-xs text-muted-foreground">
            Qty: {product?.qty} × ₹{product?.price}
          </p>
        </div>
      </div>
    )
  },
},

  /* ===================== ORDER DATE ===================== */
  {
    accessorKey: "createdAt",
    header: "Order Date",
    Cell: ({ renderedCellValue }) => {
      if (!renderedCellValue) return "-"

      const date = new Date(renderedCellValue)

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {date.toLocaleDateString("en-IN")}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )
    },
  },

  /* ===================== PAYMENT ===================== */
  {
    id: "payment",
    header: "Payment",
    Cell: ({ row }) => {
      const paymentId = row.original?.payment_id
      const paymentStatus = row.original?.paymentStatus

      let label = "Pending"
      let color = "bg-yellow-100 text-yellow-700"

      if (paymentStatus === "Failed") {
        label = "Failed"
        color = "bg-red-100 text-red-700"
      } else if (paymentId || paymentStatus === "Paid") {
        label = "Paid"
        color = "bg-green-100 text-green-700"
      }

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>
          {label}
        </span>
      )
    },
  },

  /* ===================== CUSTOMER ===================== */
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "address", header: "Address" },

  /* ===================== ITEMS ===================== */
  {
    header: "Items",
    Cell: ({ row }) => row.original?.products?.length ?? 0,
  },

  /* ===================== PRICING ===================== */
  {
    accessorKey: "discount",
    header: "Discount",
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },

  /* ===================== ORDER STATUS ===================== */
  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ renderedCellValue }) => {
      const key = normalizeStatus(renderedCellValue)
      const status = ORDER_STATUS_MAP[key] || ORDER_STATUS_MAP.pending

      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${status.class}`}
        >
          {status.label}
        </span>
      )
    },
  },
]
