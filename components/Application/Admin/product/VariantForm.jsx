'use client'

import { useEffect, useMemo, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Boxes, Check, ImageIcon, IndianRupee, Package, Palette, Ruler, Wand2 } from "lucide-react"
import Select from "@/components/Application/Select"
import useFetch from "@/hooks/useFetch"
import { showToast } from "@/lib/showToast"
import { cn } from "@/lib/utils"
import { variantBulkFormSchema, variantFormSchema } from "@/lib/productSchemas"
import { calcDiscount, calcSavings, calcSellingPrice, formatINR, toNumber } from "@/lib/pricing"
import { GENDER_OPTIONS, SIZE_CHARTS, getSizeRow } from "@/lib/shoeSizes"
import { ADMIN_PRODUCT_VARIANT_SHOW } from "@/routes/AdminPanelRoute"
import DeviceMediaUploader from "./DeviceMediaUploader"
import { FieldError, Label, Section, StatPill, SubmitBar, inputCls } from "./AdminUI"

export const COLOR_PRESETS = [
  { name: "Black", code: "#111111" },
  { name: "White", code: "#f5f5f5" },
  { name: "Grey", code: "#9ca3af" },
  { name: "Navy", code: "#1e3a8a" },
  { name: "Blue", code: "#2563eb" },
  { name: "Red", code: "#dc2626" },
  { name: "Orange", code: "#f97316" },
  { name: "Yellow", code: "#facc15" },
  { name: "Green", code: "#16a34a" },
  { name: "Olive", code: "#65743a" },
  { name: "Brown", code: "#7c4a2d" },
  { name: "Beige", code: "#d6c3a5" },
  { name: "Pink", code: "#ec4899" },
  { name: "Purple", code: "#7c3aed" },
]

const makeSku = (slug, color, gender, size) =>
  [
    (slug || "PRD").replace(/-/g, "").slice(0, 10),
    (color || "CLR").replace(/\s+/g, "").slice(0, 3),
    (gender || "x")[0],
    String(size).replace(".", "H"),
  ]
    .join("-")
    .toUpperCase()

/**
 *  mode="add"  → one colour, many sizes  → POST /api/product-variant/create
 *  mode="edit" → one size                → PUT  /api/product-variant/update  (pass `initial`)
 */
export default function VariantForm({ mode = "add", initial = null }) {
  const router = useRouter()
  const isEdit = mode === "edit"
  const [loading, setLoading] = useState(false)
  const [busyUploading, setBusyUploading] = useState(false)
  const [images, setImages] = useState([])
  const [discountInput, setDiscountInput] = useState("0")
  const [bulkStock, setBulkStock] = useState("")

  const { data: getProduct } = useFetch("/api/product?deleteType=SD&&size=10000")
  const products = useMemo(() => (getProduct?.success ? getProduct.data : []), [getProduct])
  const productOptions = useMemo(() => products.map((p) => ({ label: p.name, value: p._id })), [products])

  const form = useForm({
    resolver: zodResolver(isEdit ? variantFormSchema : variantBulkFormSchema),
    defaultValues: {
      product: "",
      color: "",
      colorCode: "#111111",
      gender: "men",
      mrp: "",
      sellingPrice: "",
      ...(isEdit ? { size: "", stock: 0, sku: "" } : { sizes: [] }),
    },
  })
  const { register, handleSubmit, setValue, watch, control, reset, formState } = form
  const errors = formState.errors
  const sizeRows = useFieldArray({ control, name: "sizes" })

  /* ---------- Edit: load existing ---------- */
  useEffect(() => {
    if (!initial) return
    reset({
      product: initial.product?._id || initial.product || "",
      color: initial.color || "",
      colorCode: /^#[0-9a-f]{6}$/i.test(initial.colorCode || "") ? initial.colorCode : "#111111",
      gender: initial.gender || "men",
      mrp: initial.mrp ?? "",
      sellingPrice: initial.sellingPrice ?? "",
      size: String(initial.size || "").replace(/-w$/i, ""),
      stock: initial.stock ?? 0,
      sku: initial.sku || "",
    })
    setImages((initial.media || []).map((m) => ({ _id: m._id, url: m.secure_url })))
    setDiscountInput(String(calcDiscount(initial.mrp, initial.sellingPrice)))
  }, [initial, reset])

  const productId = watch("product")
  const color = watch("color")
  const colorCode = watch("colorCode")
  const gender = watch("gender")
  const mrp = watch("mrp")
  const sellingPrice = watch("sellingPrice")
  const selectedProduct = products.find((p) => p._id === productId)
  const chart = SIZE_CHARTS[gender] || []

  /* ---------- Add: prefill price from the chosen product ---------- */
  useEffect(() => {
    if (isEdit || !selectedProduct) return
    setValue("mrp", String(selectedProduct.mrp ?? ""), { shouldValidate: false })
    setValue("sellingPrice", String(selectedProduct.sellingPrice ?? ""), { shouldValidate: false })
    setDiscountInput(String(calcDiscount(selectedProduct.mrp, selectedProduct.sellingPrice)))
  }, [selectedProduct?._id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Add: keep auto SKUs in sync with product / colour / gender ---------- */
  useEffect(() => {
    if (isEdit) return
    sizeRows.fields.forEach((row, i) => {
      const current = form.getValues(`sizes.${i}.sku`)
      const wasAuto = !current || current === row.autoSku
      const auto = makeSku(selectedProduct?.slug, color, gender, row.size)
      if (wasAuto) setValue(`sizes.${i}.sku`, auto)
      sizeRows.update(i, { ...form.getValues(`sizes.${i}`), sku: wasAuto ? auto : current, autoSku: auto })
    })
  }, [selectedProduct?.slug, color, gender]) // eslint-disable-line react-hooks/exhaustive-deps

  // Changing gender clears selected sizes (different chart)
  const changeGender = (g) => {
    if (g === gender) return
    setValue("gender", g, { shouldValidate: true })
    if (!isEdit) sizeRows.replace([])
    else setValue("size", "")
  }

  const toggleSize = (value) => {
    if (isEdit) return setValue("size", value, { shouldValidate: true })
    const idx = sizeRows.fields.findIndex((f) => f.size === value)
    if (idx >= 0) return sizeRows.remove(idx)
    const auto = makeSku(selectedProduct?.slug, color, gender, value)
    // keep rows in chart order
    const order = chart.map((r) => r.value)
    const next = [...form.getValues("sizes"), { size: value, stock: bulkStock || 0, sku: auto, autoSku: auto }].sort(
      (a, b) => order.indexOf(a.size) - order.indexOf(b.size)
    )
    sizeRows.replace(next)
  }
  const selectedSizes = isEdit ? [watch("size")] : sizeRows.fields.map((f) => f.size)

  const applyStockToAll = () => {
    const n = Math.max(0, parseInt(bulkStock || "0", 10) || 0)
    form.getValues("sizes").forEach((_, i) => setValue(`sizes.${i}.stock`, n, { shouldValidate: true }))
  }

  /* ---------- Price ↔ discount ---------- */
  const onMrpChange = (v) => {
    setValue("mrp", v, { shouldValidate: true })
    if (toNumber(discountInput) > 0) setValue("sellingPrice", String(calcSellingPrice(v, discountInput)), { shouldValidate: true })
  }
  const onSellingChange = (v) => {
    setValue("sellingPrice", v, { shouldValidate: true })
    setDiscountInput(String(calcDiscount(mrp, v)))
  }
  const onDiscountChange = (v) => {
    const d = Math.min(Math.max(toNumber(v), 0), 99)
    setDiscountInput(v === "" ? "" : String(d))
    if (toNumber(mrp) > 0) setValue("sellingPrice", String(calcSellingPrice(mrp, d)), { shouldValidate: true })
  }
  const discount = calcDiscount(mrp, sellingPrice)
  const totalStock = isEdit
    ? toNumber(watch("stock"))
    : (watch("sizes") || []).reduce((s, r) => s + (parseInt(r.stock, 10) || 0), 0)

  /* ---------- Submit ---------- */
  const onSubmit = async (values) => {
    if (busyUploading) return showToast("error", "Please wait for uploads to finish.")
    if (!images.length) return showToast("error", "Add at least one image for this colour.")
    setLoading(true)
    try {
      const media = images.map((m) => m._id)
      const payload = isEdit
        ? { ...values, _id: initial._id, media }
        : { ...values, media, sizes: values.sizes.map(({ size, stock, sku }) => ({ size, stock, sku })) }
      const { data: res } = isEdit
        ? await axios.put("/api/product-variant/update", payload)
        : await axios.post("/api/product-variant/create", payload)
      if (!res.success) throw new Error(res.message)
      showToast("success", res.message)
      if (isEdit) router.push(ADMIN_PRODUCT_VARIANT_SHOW)
      else {
        // keep product + price for the next colour, clear colour-specific fields
        sizeRows.replace([])
        setValue("color", "")
        setImages([])
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Product + gender */}
          <Section icon={Package} title="Product" description="Which shoe is this variant for?">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label required>Product</Label>
                <Controller
                  control={control}
                  name="product"
                  render={({ field }) => (
                    <Select options={productOptions} selected={field.value} setSelected={field.onChange} isMulti={false} placeholder="Search product" />
                  )}
                />
                <FieldError message={errors.product?.message} />
              </div>
              <div>
                <Label required>Gender / size chart</Label>
                <div className="grid h-11 grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => changeGender(g.value)}
                      className={cn(
                        "rounded-lg text-sm font-semibold transition cursor-pointer",
                        gender === g.value ? "bg-background text-orange-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <FieldError message={errors.gender?.message} />
              </div>
            </div>
          </Section>

          {/* Colour */}
          <Section icon={Palette} title="Colour" description="Name + the exact colour shown as a swatch on the website.">
            <div className="grid gap-5 md:grid-cols-[1fr_auto]">
              <div>
                <Label required htmlFor="color">Colour name</Label>
                <input id="color" {...register("color")} placeholder="e.g. Volt Green, Triple Black" className={inputCls} />
                <FieldError message={errors.color?.message} />
              </div>
              <div>
                <Label required>Swatch</Label>
                <div className="flex h-11 items-center gap-2 rounded-xl border bg-background px-2">
                  <input
                    type="color"
                    value={colorCode}
                    onChange={(e) => setValue("colorCode", e.target.value, { shouldValidate: true })}
                    className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <input
                    value={colorCode}
                    onChange={(e) => setValue("colorCode", e.target.value, { shouldValidate: true })}
                    className="w-24 bg-transparent font-mono text-sm uppercase outline-none"
                  />
                </div>
                <FieldError message={errors.colorCode?.message} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => {
                    setValue("colorCode", c.code, { shouldValidate: true })
                    if (!color) setValue("color", c.name, { shouldValidate: true })
                  }}
                  className={cn(
                    "group flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition hover:border-orange-400 cursor-pointer",
                    colorCode?.toLowerCase() === c.code && "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                  )}
                >
                  <span className="h-5 w-5 rounded-full border shadow-inner" style={{ backgroundColor: c.code }} />
                  {c.name}
                </button>
              ))}
            </div>
          </Section>

          {/* Sizes */}
          <Section
            icon={Ruler}
            title={isEdit ? "Size" : "Sizes, stock & SKU"}
            description={`${GENDER_OPTIONS.find((g) => g.value === gender)?.label} chart · stored as UK size (Indian sizes = UK)`}
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
              {chart.map((r) => {
                const on = selectedSizes.includes(r.value)
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleSize(r.value)}
                    className={cn(
                      "relative rounded-xl border p-2 text-center transition cursor-pointer",
                      on ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/30" : "hover:border-orange-400"
                    )}
                  >
                    {on && <Check className="absolute right-1 top-1 h-3 w-3" />}
                    <p className="text-sm font-bold">UK {r.uk}</p>
                    <p className={cn("text-[10px]", on ? "text-white/85" : "text-muted-foreground")}>
                      US {r.us} · EU {r.eu}
                    </p>
                  </button>
                )
              })}
            </div>
            <FieldError message={isEdit ? errors.size?.message : errors.sizes?.message || errors.sizes?.root?.message} />

            {isEdit ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <Label required htmlFor="stock">Stock</Label>
                  <input id="stock" type="number" min="0" {...register("stock")} className={inputCls} />
                  <FieldError message={errors.stock?.message} />
                </div>
                <div>
                  <Label required htmlFor="sku">SKU</Label>
                  <input id="sku" {...register("sku")} className={`${inputCls} font-mono uppercase`} />
                  <FieldError message={errors.sku?.message} />
                </div>
              </div>
            ) : (
              sizeRows.fields.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-2xl border">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/50 px-4 py-2.5">
                    <p className="text-sm font-semibold">{sizeRows.fields.length} size(s) selected</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={bulkStock}
                        onChange={(e) => setBulkStock(e.target.value)}
                        placeholder="Stock"
                        className="h-9 w-24 rounded-lg border bg-background px-2 text-sm outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={applyStockToAll}
                        className="inline-flex h-9 items-center gap-1 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600 cursor-pointer"
                      >
                        <Wand2 className="h-3.5 w-3.5" /> Apply to all
                      </button>
                    </div>
                  </div>
                  <div className="divide-y">
                    {sizeRows.fields.map((row, i) => {
                      const r = getSizeRow(gender, row.size)
                      return (
                        <div key={row.id} className="grid grid-cols-[90px_1fr] items-start gap-3 px-4 py-3 sm:grid-cols-[110px_120px_1fr]">
                          <div>
                            <p className="font-bold">UK {r.uk}</p>
                            <p className="text-[11px] text-muted-foreground">IN {r.in} · US {r.us} · EU {r.eu}</p>
                          </div>
                          <div>
                            <input
                              type="number"
                              min="0"
                              {...register(`sizes.${i}.stock`)}
                              placeholder="Stock"
                              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-orange-500"
                            />
                            <FieldError message={errors.sizes?.[i]?.stock?.message} />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <input
                              {...register(`sizes.${i}.sku`)}
                              placeholder="SKU"
                              className="h-10 w-full rounded-lg border bg-background px-3 font-mono text-sm uppercase outline-none focus:border-orange-500"
                            />
                            <FieldError message={errors.sizes?.[i]?.sku?.message} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </Section>

          {/* Images */}
          <Section icon={ImageIcon} title={`Images for "${color || "this colour"}"`} description="Shown when a customer picks this colour.">
            <DeviceMediaUploader
              images={images}
              setImages={setImages}
              video={null}
              setVideo={() => {}}
              allowVideo={false}
              onBusyChange={setBusyUploading}
              folder="products/variants"
              label="colour images"
            />
          </Section>
        </div>

        {/* RIGHT */}
        <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <Section icon={IndianRupee} title="Pricing" description={selectedProduct ? "Pre-filled from the product." : "Pick a product first."}>
            <div className="space-y-4">
              <div>
                <Label required htmlFor="vmrp">MRP (₹)</Label>
                <input id="vmrp" type="number" min="0" value={mrp} onChange={(e) => onMrpChange(e.target.value)} className={inputCls} />
                <FieldError message={errors.mrp?.message} />
              </div>
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <div>
                  <Label required htmlFor="vsp">Selling price (₹)</Label>
                  <input id="vsp" type="number" min="0" value={sellingPrice} onChange={(e) => onSellingChange(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label htmlFor="vdisc">Discount</Label>
                  <div className="relative">
                    <input id="vdisc" type="number" min="0" max="99" value={discountInput} onChange={(e) => onDiscountChange(e.target.value)} className={`${inputCls} pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              <FieldError message={errors.sellingPrice?.message} />
              <div className="grid grid-cols-2 gap-3">
                <StatPill label="Discount" value={`${discount}%`} tone={discount > 0 ? "orange" : "default"} />
                <StatPill label="Saves" value={formatINR(calcSavings(mrp, sellingPrice))} tone="green" />
              </div>
            </div>
          </Section>

          <Section icon={Boxes} title="Summary">
            <div className="flex items-center gap-3 rounded-2xl border p-3">
              <span className="h-12 w-12 shrink-0 rounded-xl border shadow-inner" style={{ backgroundColor: colorCode }} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{selectedProduct?.name || "No product selected"}</p>
                <p className="text-sm text-muted-foreground">
                  {color || "Colour"} · {GENDER_OPTIONS.find((g) => g.value === gender)?.label}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatPill label={isEdit ? "Size" : "Sizes"} value={isEdit ? (watch("size") ? `UK ${watch("size")}` : "—") : sizeRows.fields.length} />
              <StatPill label="Total stock" value={totalStock} tone={totalStock > 0 ? "green" : "red"} />
            </div>
          </Section>
        </div>
      </div>

      <SubmitBar
        loading={loading || busyUploading}
        label={busyUploading ? "Uploading…" : isEdit ? "Save variant" : `Add ${sizeRows.fields.length || ""} variant${sizeRows.fields.length === 1 ? "" : "s"}`}
        onCancelHref={ADMIN_PRODUCT_VARIANT_SHOW}
      />
    </form>
  )
}
