'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import slugify from 'slugify'
import { useRouter } from 'next/navigation'
import { FolderTree, Link2, Lock, Unlock } from 'lucide-react'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_CATEGORY_SHOW } from '@/routes/AdminPanelRoute'
import { FieldError, Label, Section, SubmitBar, inputCls } from './AdminUI'

const QUICK = ["Running", "Sneakers", "Sports", "Casual", "Formal", "Sandals", "Boots", "Kids Shoes"]

/** mode="add" → POST /api/category/create · mode="edit" → PUT /api/category/update */
export default function CategoryForm({ mode = 'add', initial = null }) {
  const router = useRouter()
  const isEdit = mode === 'edit'
  const [loading, setLoading] = useState(false)
  const [slugLocked, setSlugLocked] = useState(!isEdit)

  const form = useForm({
    resolver: zodResolver(isEdit ? zSchema.pick({ _id: true, name: true, slug: true }) : zSchema.pick({ name: true, slug: true })),
    defaultValues: { ...(isEdit ? { _id: '' } : {}), name: '', slug: '' },
  })
  const { register, handleSubmit, setValue, watch, reset, formState } = form
  const errors = formState.errors
  const name = watch('name')
  const slug = watch('slug')

  useEffect(() => {
    if (initial) reset({ _id: initial._id, name: initial.name || '', slug: initial.slug || '' })
  }, [initial, reset])

  useEffect(() => {
    if (slugLocked && name) setValue('slug', slugify(name, { lower: true, strict: true }), { shouldValidate: !!slug })
  }, [name, slugLocked]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data: res } = isEdit
        ? await axios.put('/api/category/update', values)
        : await axios.post('/api/category/create', values)
      if (!res.success) throw new Error(res.message)
      showToast('success', res.message)
      if (isEdit) router.push(ADMIN_CATEGORY_SHOW)
      else reset({ name: '', slug: '' })
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Section icon={FolderTree} title="Category details" description="Shown in the shop filters and the header menu.">
          <div className="space-y-5">
            <div>
              <Label required htmlFor="cname">Category name</Label>
              <input id="cname" {...register('name')} placeholder="e.g. Running" className={inputCls} />
              <FieldError message={errors.name?.message} />
              {!isEdit && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setValue('name', q, { shouldValidate: true })}
                      className="rounded-full border px-3 py-1 text-xs font-medium transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label required htmlFor="cslug" hint="Used in shop URLs">Slug</Label>
              <div className="flex items-center gap-2">
                <div className="flex h-11 flex-1 items-center overflow-hidden rounded-xl border bg-background focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15">
                  <span className="flex h-full items-center border-r bg-muted px-3 text-xs text-muted-foreground">
                    <Link2 className="mr-1 h-3.5 w-3.5" /> ?category=
                  </span>
                  <input id="cslug" {...register('slug')} readOnly={slugLocked} className="h-full flex-1 bg-transparent px-3 text-sm outline-none read-only:text-muted-foreground" />
                </div>
                <button
                  type="button"
                  onClick={() => setSlugLocked((l) => !l)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:border-orange-500 hover:text-orange-600 cursor-pointer"
                  title={slugLocked ? 'Edit slug manually' : 'Auto from name'}
                >
                  {slugLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={errors.slug?.message} />
            </div>
          </div>
        </Section>

        {/* Preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="relative flex h-40 items-end overflow-hidden bg-linear-to-br from-neutral-900 to-neutral-700 p-5">
              <span className="pointer-events-none absolute -right-4 -top-6 select-none text-8xl font-black uppercase text-white/10">
                {(name || 'Cat').slice(0, 4)}
              </span>
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">Category</p>
                <p className="text-2xl font-bold text-white">{name || 'Category name'}</p>
              </div>
            </div>
            <div className="p-4 text-sm text-muted-foreground">
              Shop link: <span className="font-mono text-foreground">/shop?category={slug || 'slug'}</span>
            </div>
          </div>
        </div>
      </div>

      <SubmitBar loading={loading} label={isEdit ? 'Save category' : 'Add category'} onCancelHref={ADMIN_CATEGORY_SHOW} />
    </form>
  )
}
