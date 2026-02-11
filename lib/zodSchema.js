import {z} from "zod";

export const zSchema = z.object({
     email: z
     .string()
     .email({message: "Invalid email address"}),

     password: z
     .string()
     .min(8, "Password must be at least 8 characters")
     .regex(/[a-z]/, "Password must contain at least one lowercase letter")
     .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
     .regex(/[0-9]/, "Password must contain at least one number")
     .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
     .regex(/^\S+$/, "Password must not contain spaces"),

     name: z
     .string()
     .min(2, "Name is required")
     .max(50, "Name must be at most 50 characters")
     .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, apostrophes, and hyphens"),

     otp: z.string().regex(/^\d{6}$/, {
     message: "OTP must be a 6-digit number",
     }),
     _id: z.string().min(3, '_id is required.'),
     alt: z.string().min(3, 'Alt is required.'),
     title: z.string().min(3, 'Title is required.'),
     slug: z.string().min(3, 'Slug is required.'),

     category: z.string().min(1, 'Category is required'),
     mrp: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     sellingPrice: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     discountPercentage: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     description: z.string().min(1, 'Description is required.'),
     media: z.array(z.string()),
     product: z.string().min(3, 'Product is required'),
     color: z.string().min(3, 'Color is required'),
     size: z.string().min(1, 'Size is required'),
     sku: z.string().min(3, 'SKU is required'),
     code: z.string().min(3, 'SKU is required'),
     minShoppingAmount: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     amount: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     validity: z.coerce.date(),
     gender: z.enum(["men", "women", "kids"], { errorMap: () => ({ message: "Gender is required" }),}),
     productId: z.string().min(3, "Product id is required"),
     userId: z.string().min(3, "User id is required"),
     rating: z.union([
          z.number().positive('Expected positive value, received negative.'),
          z.string().transform((val)=> Number(val)).refine((val) => !isNaN(val) && val >=0, 'Please enter a valid number.')
     ]),
     review: z.string().min(3, 'Review is required.'),
     code:  z.string().min(3, 'Coupon code is required.'),
     phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
     country:  z.string().min(3, 'Country is required.'),
     state:  z.string().min(3, 'State is required.'),
     city:  z.string().min(3, 'City is required.'),
     pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
     landmark:  z.string().min(3, 'Landmark is required.'),
     ordernote: z
               .string()
               .optional()
               .refine(val => !val || val.trim().length >= 3, {
               message: "Order note must be at least 3 characters",
               }),
     });




