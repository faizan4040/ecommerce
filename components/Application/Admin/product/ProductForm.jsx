'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import slugify from "slugify"
import { toHtml } from "@/lib/richText"
import { SIZE_SYSTEMS } from "@/lib/shoeSizes"
import { useRouter } from "next/navigation"
import { FileText, ImageIcon, IndianRupee, Info, Link2, Lock, Ruler, Search, Tags, Unlock, X } from "lucide-react"
import Editor from "@/components/Application/Admin/Editor"
import Select from "@/components/Application/Select"
import useFetch from "@/hooks/useFetch"
import { showToast } from "@/lib/showToast"
import { productFormSchema } from "@/lib/productSchemas"
import { calcDiscount, calcSavings, calcSellingPrice, formatINR, toNumber } from "@/lib/pricing"
import { ADMIN_PRODUCT_SHOW } from "@/routes/AdminPanelRoute"
import DeviceMediaUploader from "./DeviceMediaUploader"
import { FieldError, Label, Section, StatPill, SubmitBar, inputCls } from "./AdminUI"

const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://yourstore.com"

/**
 * Add / Edit product form.
 *  mode="add"  → POST /api/product/create
 *  mode="edit" → PUT  /api/product/update   (pass `initial` = product from /api/product/get/:id)
 */
export default function ProductForm({ mode = "add", initial = null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [busyUploading, setBusyUploading] = useState(false)
  const [slugLocked, setSlugLocked] = useState(mode === "add")
  const [images, setImages] = useState([])
  const [video, setVideo] = useState(null)
  const [keywordInput, setKeywordInput] = useState("")
  const [discountInput, setDiscountInput] = useState("0")

  const { data: getCategory } = useFetch("/api/category?deleteType=SD&&size=10000")
  const categoryOptions = useMemo(
    () => (getCategory?.success ? getCategory.data.map((c) => ({ label: c.name, value: c._id })) : []),
    [getCategory]
  )

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      brand: "",
      mrp: "",
      sellingPrice: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      sizeSystems: ["in", "uk", "us", "eu"],
    },
  })
  const { register, handleSubmit, setValue, watch, control, reset, formState } = form
  const errors = formState.errors

  /* ---------- Load product in edit mode ---------- */
  useEffect(() => {
    if (!initial) return
    reset({
      name: initial.name || "",
      slug: initial.slug || "",
      category: initial.category?._id || initial.category || "",
      brand: initial.brand || "",
      mrp: initial.mrp ?? "",
      sellingPrice: initial.sellingPrice ?? "",
      // stored HTML-encoded – decode so saving without edits doesn't double-encode it
      // old descriptions may be Markdown – convert to HTML so the editor shows real formatting
      description: toHtml(initial.description),
      metaTitle: initial.seo?.metaTitle || "",
      metaDescription: initial.seo?.metaDescription || "",
      keywords: initial.seo?.keywords || [],
      sizeSystems: initial.sizeSystems?.length ? initial.sizeSystems : ["uk"],
    })
    setImages((initial.media || []).map((m) => ({ _id: m._id, url: m.secure_url })))
    setVideo(initial.video?.url ? initial.video : null)
    setDiscountInput(String(calcDiscount(initial.mrp, initial.sellingPrice)))
  }, [initial, reset])

  const name = watch("name")
  const slug = watch("slug")
  const mrp = watch("mrp")
  const sellingPrice = watch("sellingPrice")
  const metaTitle = watch("metaTitle")
  const metaDescription = watch("metaDescription")
  const keywords = watch("keywords")
  const description = watch("description")

  /* ---------- Auto slug from name (unless unlocked & edited) ---------- */
  useEffect(() => {
    if (slugLocked && name) setValue("slug", slugify(name, { lower: true, strict: true }), { shouldValidate: !!slug })
  }, [name, slugLocked]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Two-way price ↔ discount ---------- */
  const onMrpChange = (v) => {
    setValue("mrp", v, { shouldValidate: true })
    // keep the discount % the admin typed, recalculate selling price
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
  const savings = calcSavings(mrp, sellingPrice)

  /* ---------- Keywords (tag input) ---------- */
  const addKeyword = useCallback(
    (raw) => {
      const parts = raw.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean)
      if (!parts.length) return
      const next = [...new Set([...(keywords || []), ...parts])].slice(0, 20)
      setValue("keywords", next, { shouldValidate: true })
      setKeywordInput("")
    },
    [keywords, setValue]
  )
  const removeKeyword = (k) => setValue("keywords", keywords.filter((x) => x !== k), { shouldValidate: true })

  const suggestKeywords = () => {
    const cat = categoryOptions.find((c) => c.value === watch("category"))?.label
    const brand = watch("brand")
    const base = [name, brand, cat, `${name} shoes`, brand && `${brand} shoes`, cat && `${cat} shoes online`, "buy shoes online india"]
    addKeyword(base.filter(Boolean).join(","))
  }

  /* ---------- Submit ---------- */
  const onSubmit = async (values) => {
    if (busyUploading) return showToast("error", "Please wait for uploads to finish.")
    if (!images.length) return showToast("error", "Add at least one product image.")
    setLoading(true)
    try {
      const payload = {
        ...values,
        media: images.map((m) => m._id),
        video,
        ...(mode === "edit" ? { _id: initial._id } : {}),
      }
      const { data: res } =
        mode === "edit"
          ? await axios.put("/api/product/update", payload)
          : await axios.post("/api/product/create", payload)
      if (!res.success) throw new Error(res.message)
      showToast("success", res.message)
      if (mode === "add") {
        reset()
        setImages([])
        setVideo(null)
        setDiscountInput("0")
        setSlugLocked(true)
      } else {
        router.push(ADMIN_PRODUCT_SHOW)
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const seoTitle = metaTitle || name || "Product title"
  const seoDesc =
    metaDescription ||
    (description || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim().slice(0, 155) ||
    "Your meta description will appear here in Google search results."

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* ================= LEFT ================= */}
        <div className="space-y-6">
          {/* Basic info */}
          <Section icon={Info} title="Basic information" description="Name, URL, category and brand.">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label required htmlFor="name">Product name</Label>
                <input id="name" {...register("name")} placeholder="e.g. Air Max 720 Running Shoes" className={inputCls} />
                <FieldError message={errors.name?.message} />
              </div>

              <div className="md:col-span-2">
                <Label required htmlFor="slug" hint="Used in the product URL">URL slug</Label>
                <div className="flex items-center gap-2">
                  <div className="flex h-11 flex-1 items-center overflow-hidden rounded-xl border bg-background focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15">
                    <span className="hidden h-full items-center border-r bg-muted px-3 text-xs text-muted-foreground sm:flex">
                      <Link2 className="mr-1 h-3.5 w-3.5" /> /product/
                    </span>
                    <input
                      id="slug"
                      {...register("slug")}
                      readOnly={slugLocked}
                      className="h-full flex-1 bg-transparent px-3 text-sm outline-none read-only:text-muted-foreground"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSlugLocked((l) => !l)}
                    title={slugLocked ? "Edit slug manually" : "Auto-generate from name"}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:border-orange-500 hover:text-orange-600 cursor-pointer"
                  >
                    {slugLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.slug?.message} />
              </div>

              <div>
                <Label required>Category</Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select
                      options={categoryOptions}
                      selected={field.value}
                      setSelected={field.onChange}
                      isMulti={false}
                      placeholder="Select category"
                    />
                  )}
                />
                <FieldError message={errors.category?.message} />
              </div>

              <div>
                <Label htmlFor="brand" hint="Optional">Brand</Label>
                <input id="brand" {...register("brand")} placeholder="e.g. Nike, Adidas, KMF" className={inputCls} />
                <FieldError message={errors.brand?.message} />
              </div>
            </div>
          </Section>

          {/* Description */}
          <Section icon={FileText} title="Description" description="Tell customers what makes this shoe special.">
            <div className="overflow-hidden rounded-xl border [&_.ck-editor__editable]:min-h-48">
              <Editor
                initialData={initial ? toHtml(initial.description) : ""}
                onChange={(_, editor) => setValue("description", editor.getData(), { shouldValidate: true })}
              />
            </div>
            <FieldError message={errors.description?.message} />
          </Section>

          {/* Size systems */}
          <Section
            icon={Ruler}
            title="Size systems on website"
            description="Choose which size labels customers can switch between on the product page."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SIZE_SYSTEMS.map((sys) => {
                const on = (watch("sizeSystems") || []).includes(sys.key)
                return (
                  <button
                    key={sys.key}
                    type="button"
                    onClick={() => {
                      const cur = watch("sizeSystems") || []
                      const next = on ? cur.filter((k) => k !== sys.key) : [...cur, sys.key]
                      setValue("sizeSystems", SIZE_SYSTEMS.map((s) => s.key).filter((k) => next.includes(k)), { shouldValidate: true })
                    }}
                    className={`rounded-2xl border-2 p-4 text-left transition cursor-pointer ${
                      on ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold">{sys.label}</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 text-[11px] font-bold ${on ? "border-orange-500 bg-orange-500 text-white" : ""}`}>
                        {on && "✓"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {{ in: "India", uk: "United Kingdom", us: "United States", eu: "Europe" }[sys.key]}
                    </p>
                  </button>
                )
              })}
            </div>
            <FieldError message={errors.sizeSystems?.message} />
            <p className="mt-3 text-xs text-muted-foreground">
              Pick one to show a single size label, or several to give customers an IN / UK / US / EU switch.
            </p>
          </Section>

          {/* Media */}
          <Section
            icon={ImageIcon}
            title="Images & video"
            description="Upload straight from your computer or phone – no Media library step needed."
          >
            <DeviceMediaUploader
              images={images}
              setImages={setImages}
              video={video}
              setVideo={setVideo}
              onBusyChange={setBusyUploading}
              folder="products"
            />
          </Section>

          {/* SEO */}
          <Section
            icon={Search}
            title="Search engine listing (SEO)"
            description="Control how this product appears on Google."
            action={
              <button
                type="button"
                onClick={suggestKeywords}
                className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-100 dark:bg-orange-500/10 cursor-pointer"
              >
                ✨ Suggest keywords
              </button>
            }
          >
            {/* Google preview */}
            <div className="mb-5 rounded-2xl border bg-background p-4">
              <p className="text-xs text-muted-foreground">Google preview</p>
              <p className="mt-2 truncate text-xs text-emerald-700 dark:text-emerald-400">
                {SITE.replace(/^https?:\/\//, "")} › product › {slug || "your-product"}
              </p>
              <p className="mt-0.5 line-clamp-1 text-lg font-medium text-blue-700 dark:text-blue-400">{seoTitle}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{seoDesc}</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="metaTitle" hint={`${(metaTitle || "").length}/70`}>Meta title</Label>
                <input id="metaTitle" {...register("metaTitle")} placeholder={name || "Defaults to product name"} className={inputCls} />
                <CharBar value={(metaTitle || "").length} max={70} ideal={[30, 60]} />
                <FieldError message={errors.metaTitle?.message} />
              </div>

              <div>
                <Label htmlFor="metaDescription" hint={`${(metaDescription || "").length}/160`}>Meta description</Label>
                <textarea
                  id="metaDescription"
                  rows={3}
                  {...register("metaDescription")}
                  placeholder="Short summary shown under the title in search results."
                  className={`${inputCls} h-auto py-3`}
                />
                <CharBar value={(metaDescription || "").length} max={160} ideal={[70, 155]} />
                <FieldError message={errors.metaDescription?.message} />
              </div>

              <div>
                <Label hint={`${keywords?.length || 0}/20 · press Enter or comma`}>
                  <span className="inline-flex items-center gap-1.5"><Tags className="h-4 w-4" /> Keywords</span>
                </Label>
                <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border bg-background p-2 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15">
                  {keywords?.map((k) => (
                    <span key={k} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                      {k}
                      <button type="button" onClick={() => removeKeyword(k)} className="cursor-pointer hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        addKeyword(keywordInput)
                      } else if (e.key === "Backspace" && !keywordInput && keywords?.length) {
                        removeKeyword(keywords[keywords.length - 1])
                      }
                    }}
                    onBlur={() => keywordInput && addKeyword(keywordInput)}
                    placeholder={keywords?.length ? "" : "running shoes, men sneakers, …"}
                    className="min-w-40 flex-1 bg-transparent px-1 text-sm outline-none"
                  />
                </div>
                <FieldError message={errors.keywords?.message} />
              </div>
            </div>
          </Section>
        </div>

        {/* ================= RIGHT (sticky) ================= */}
        <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <Section icon={IndianRupee} title="Pricing" description="Base price – variants can override it.">
            <div className="space-y-4">
              <div>
                <Label required htmlFor="mrp">MRP (₹)</Label>
                <input
                  id="mrp"
                  type="number"
                  min="0"
                  step="1"
                  value={mrp}
                  onChange={(e) => onMrpChange(e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
                <FieldError message={errors.mrp?.message} />
              </div>

              <div className="grid grid-cols-[1fr_110px] gap-3">
                <div>
                  <Label required htmlFor="sp">Selling price (₹)</Label>
                  <input
                    id="sp"
                    type="number"
                    min="0"
                    step="1"
                    value={sellingPrice}
                    onChange={(e) => onSellingChange(e.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label htmlFor="disc">Discount</Label>
                  <div className="relative">
                    <input
                      id="disc"
                      type="number"
                      min="0"
                      max="99"
                      value={discountInput}
                      onChange={(e) => onDiscountChange(e.target.value)}
                      className={`${inputCls} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              <FieldError message={errors.sellingPrice?.message} />

              <div className="grid grid-cols-2 gap-3">
                <StatPill label="Discount" value={`${discount}%`} tone={discount > 0 ? "orange" : "default"} />
                <StatPill label="Customer saves" value={formatINR(savings)} tone={savings > 0 ? "green" : "default"} />
              </div>
              <p className="text-xs text-muted-foreground">
                Type a selling price <b>or</b> a discount % – the other one updates automatically. The server
                re-checks the maths when you save.
              </p>
            </div>
          </Section>

          {/* Live preview */}
          <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="aspect-[4/3] bg-linear-to-br from-amber-100 to-orange-200 p-4 dark:from-amber-500/10 dark:to-orange-500/20">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0].url} alt="" className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-orange-700/60">Cover image preview</div>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{watch("brand") || "Brand"}</p>
              <p className="line-clamp-1 font-semibold">{name || "Product name"}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold">{formatINR(sellingPrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">{formatINR(mrp)}</span>
                    <span className="text-xs font-bold text-emerald-600">{discount}% off</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubmitBar
        loading={loading || busyUploading}
        label={busyUploading ? "Uploading…" : mode === "edit" ? "Save changes" : "Publish product"}
        onCancelHref={ADMIN_PRODUCT_SHOW}
      />
    </form>
  )
}

function CharBar({ value, max, ideal }) {
  const pct = Math.min((value / max) * 100, 100)
  const good = value >= ideal[0] && value <= ideal[1]
  const color = value === 0 ? "bg-muted-foreground/30" : good ? "bg-emerald-500" : value > max ? "bg-red-500" : "bg-amber-500"
  return (
    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
      <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
