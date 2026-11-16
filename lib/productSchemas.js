import { z } from "zod"

/*
 * Validation for products & variants – shared by the admin forms and the API routes.
 * (The old generic zSchema rejected product names with numbers, e.g. "Air Max 720",
 *  and rejected a 0% discount – these schemas fix that.)
 */

const price = (label) =>
  z.coerce
    .number({ message: `${label} is required.` })
    .refine((n) => Number.isFinite(n) && n > 0, `${label} must be greater than 0.`)

const sellingNotAboveMrp = (d) => Number(d.sellingPrice) <= Number(d.mrp)
const priceRefineMsg = { message: "Selling price cannot be more than MRP.", path: ["sellingPrice"] }

export const productFormSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters.").max(120, "Name is too long."),
    slug: z
      .string()
      .trim()
      .min(3, "Slug is required.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
    category: z.string().min(1, "Category is required."),
    brand: z.string().trim().max(60).optional().default(""),
    mrp: price("MRP"),
    sellingPrice: price("Selling price"),
    description: z.string().min(10, "Description is required (min 10 characters)."),
    metaTitle: z.string().trim().max(70, "Keep meta title under 70 characters.").optional().default(""),
    metaDescription: z
      .string()
      .trim()
      .max(160, "Keep meta description under 160 characters.")
      .optional()
      .default(""),
    keywords: z.array(z.string().trim().min(1)).max(20, "Maximum 20 keywords.").optional().default([]),
    sizeSystems: z
      .array(z.enum(["in", "uk", "us", "eu"]))
      .min(1, "Select at least one size system.")
      .optional()
      .default(["uk"]),
  })
  .refine(sellingNotAboveMrp, priceRefineMsg)

const videoSchema = z
  .object({
    url: z.string().url(),
    public_id: z.string().min(1),
    thumbnail_url: z.string().optional().default(""),
  })
  .nullable()
  .optional()

// API payload = form + uploaded media ids + optional video
export const productPayloadSchema = productFormSchema.and(
  z.object({
    media: z.array(z.string().min(1)).min(1, "Add at least one product image."),
    video: videoSchema,
  })
)

export const productUpdateSchema = productPayloadSchema.and(z.object({ _id: z.string().min(3) }))

/* ---------------- Variants ---------------- */

const hex = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "Pick a valid colour.")

const variantBase = {
  product: z.string().min(3, "Product is required."),
  color: z.string().trim().min(2, "Colour name is required.").max(40),
  colorCode: hex,
  gender: z.enum(["men", "women", "kids"], { message: "Gender is required." }),
  mrp: price("MRP"),
  sellingPrice: price("Selling price"),
}

export const variantSizeRowSchema = z.object({
  size: z.string().min(1, "Size is required."),
  stock: z.coerce.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative."),
  sku: z.string().trim().min(3, "SKU is required."),
})

// Add Variant: one colour, many sizes → one variant document per size
export const variantBulkFormSchema = z
  .object({
    ...variantBase,
    sizes: z.array(variantSizeRowSchema).min(1, "Select at least one size."),
  })
  .refine(sellingNotAboveMrp, priceRefineMsg)

export const variantBulkPayloadSchema = variantBulkFormSchema.and(
  z.object({ media: z.array(z.string().min(1)).min(1, "Add at least one image for this colour.") })
)

// Edit Variant: a single size row
export const variantFormSchema = z
  .object({ ...variantBase, ...variantSizeRowSchema.shape })
  .refine(sellingNotAboveMrp, priceRefineMsg)

export const variantUpdatePayloadSchema = variantFormSchema.and(
  z.object({
    _id: z.string().min(3),
    media: z.array(z.string().min(1)).min(1, "Add at least one image."),
  })
)
