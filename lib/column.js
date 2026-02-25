import dayjs from "dayjs";
import Chip from "@mui/material/Chip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

import { XCircle, AlertTriangle, CheckCircle, Flame } from "lucide-react"
import { IMAGES } from "@/routes/AllImages";


export const DT_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Category Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },

]


export const DT_PRODUCT_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Product Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },
]



export const DT_PRODUCT_VARIANT_COLUMN = [
    {
        accessorKey: 'product',
        header: 'Product Name',
    },
    {
        accessorKey: 'color',
        header: 'Color',
    },
    {
        accessorKey: 'size',
        header: 'Size',
    },
    {
        accessorKey: "gender",   
        header: "Gender",
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
    },
    {
        accessorKey: 'stock',
        header: 'Stock',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },
]



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








export const DT_ORDER_COLUMN = [
{
    id: "product",
    header: "Product",
    Cell: ({ row }) => {
      const product = row.original?.products?.[0]

      // ✅ SAFELY PICK IMAGE (same as stock page)
      const rawImage =
        product?.variantId?.media?.[0]?.secure_url ||
        product?.variantId?.media?.[0]?.url ||
        product?.variantId?.media?.[0]?.path ||
        null

      const finalImage = rawImage
        ? rawImage.startsWith("http")
          ? rawImage
          : `${process.env.NEXT_PUBLIC_API_URL}${rawImage}`
        : IMAGES.image_placeholder

      const productName =
        product?.productId?.name || "Product"

      const sku =
        product?.variantId?.sku || "SKU"

      return (
        <div className="flex items-center gap-3 min-w-0">
          {/* PRODUCT IMAGE */}
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src={finalImage}
              alt={productName}
              fill
              sizes="40px"
              className="rounded-md border object-cover bg-white"
              unoptimized
            />
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {productName}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {sku}
            </span>
          </div>
        </div>
      )
    },
  },

  {
    accessorKey: "order_id",
    header: "Order Id",
  },
  {
    accessorKey: "payment_id",
    header: "Payment Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "pincode",
    header: "Pincode",
  },
  {
    accessorKey: "totalItem",
    header: "Total Item",
    Cell: ({ row }) => (
      <span>{row.original?.products?.length || 0}</span>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    Cell: ({ renderedCellValue }) => (
      <span>{Math.round(renderedCellValue || 0)}</span>
    ),
  },
  {
    accessorKey: "couponDiscount",
    header: "Coupon Discount",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "status",
    header: "Status",
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