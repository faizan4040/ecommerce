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
  
  });




