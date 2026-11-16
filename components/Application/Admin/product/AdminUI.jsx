'use client'

import Link from "next/link"
import { cn } from "@/lib/utils"

/* Small shared building blocks for the redesigned Product / Variant / Category admin pages */

export function PageHeader({ eyebrow, title, subtitle, icon: Icon, actions }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-orange-500 via-orange-500 to-amber-400 p-6 text-white shadow-lg shadow-orange-500/20 sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-amber-300/40 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Icon className="h-7 w-7" />
            </div>
          )}
          <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">{eyebrow}</p>}
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1 max-w-xl text-sm text-white/85">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export function HeaderButton({ href, onClick, children, variant = "light" }) {
  const cls = cn(
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer",
    variant === "light"
      ? "bg-white text-orange-600 shadow-sm hover:bg-orange-50"
      : "bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25"
  )
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

export function Section({ icon: Icon, title, description, children, className, action }) {
  return (
    <section className={cn("rounded-3xl border bg-card p-5 shadow-sm sm:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Label({ children, required, hint, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center justify-between text-sm font-medium">
      <span>
        {children}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>
}

export const inputCls =
  "h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 disabled:cursor-not-allowed disabled:opacity-60"

export function StatPill({ label, value, tone = "default" }) {
  const tones = {
    default: "bg-muted text-foreground",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  }
  return (
    <div className={cn("rounded-2xl px-4 py-3", tones[tone])}>
      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  )
}

export function SubmitBar({ loading, label, onCancelHref }) {
  return (
    <div className="sticky bottom-3 z-20 mt-6 flex items-center justify-end gap-3 rounded-2xl border bg-card/90 p-3 shadow-lg backdrop-blur">
      {onCancelHref && (
        <Link
          href={onCancelHref}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted"
        >
          Cancel
        </Link>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
        {label}
      </button>
    </div>
  )
}
