import dayjs from "dayjs";
import Chip from "@mui/material/Chip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { IMAGES } from "@/routes/AllImages"
import Image from "next/image";


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
    accessorKey: 'product',
    header: 'Product',
  },
  {
    accessorKey: 'user',
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
  id: "productImage",
  header: "Product",
  Cell: ({ row }) => {
    const products = row.original.products;

    const image =
      products?.[0]?.variantId?.media?.[0]?.url ||
      "/placeholder.png";

    return (
      <div className="flex items-center justify-center">
        <Image
          src={image}
          alt="Product"
          width={36}
          height={36}
          className="rounded-2xl object-cover border"
        />
      </div>
    );
  },
},


  {
    accessorKey: 'order_id',
    header: 'Order Id',
  },
  {
    accessorKey: 'payment_id',
    header: 'Payment Id',
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
    accessorKey: 'country',
    header: 'Country',
  },
  {
    accessorKey: 'state',
    header: 'State',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'pincode',
    header: 'Pincode',
  },
  {
    accessorKey: 'totalItem',
    header: 'Total Item',
    Cell: ({ renderedCellValue, row }) => (<span>{row?.original?.products?.length || 0}</span>)
  },
  {
    accessorKey: 'discount',
    header: 'Discount',
     Cell: ({ renderedCellValue }) => (<span>{Math.round(renderedCellValue)}</span>)
  },
  {
    accessorKey: 'couponDiscount',
    header: 'Coupon Discount',
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },

  
];



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
          alt=""
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

  { accessorKey: "totalSold", header: "Sold" },

  { accessorKey: "remainingStock", header: "Stock" },

  {
    header: "Status",
    Cell: ({ row }) => {
      if (row.original.isOutOfStock) {
        return (
          <span className="flex items-center gap-1 text-gray-500">
            <XCircle size={16} /> Out of Stock
          </span>
        )
      }

      if (row.original.isLowStock) {
        return (
          <span className="flex items-center gap-1 text-red-500 animate-pulse">
            <AlertTriangle size={16} /> Low Stock
          </span>
        )
      }

      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle size={16} /> In Stock
        </span>
      )
    },
  },

  {
    header: "Trending",
    Cell: ({ row }) =>
      row.original.totalSold > 50 ? (
        <span className="flex items-center gap-1 text-orange-500">
          <Flame size={16} /> Most Sold
        </span>
      ) : (
        "—"
      ),
  },
]