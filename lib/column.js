import dayjs from "dayjs";
import Chip from "@mui/material/Chip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { IMAGES } from "@/routes/Images"


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
        accessorKey: 'sku',
        header: 'SKU',
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
