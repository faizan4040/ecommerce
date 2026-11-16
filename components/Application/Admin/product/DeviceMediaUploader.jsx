'use client'

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { ImagePlus, Loader2, Play, Star, Trash2, UploadCloud, Video, X } from "lucide-react"
import { showToast } from "@/lib/showToast"
import { cn } from "@/lib/utils"

/*
 * Pick images (and an optional video) straight from the device.
 * Files upload directly from the browser to Cloudinary using a signature from
 * /api/cloudinary-signature – no need to add them to the Media library first.
 * Images are still saved as Media documents (so cart/orders/admin keep working).
 *
 *   images: [{ _id, url }]              – first image = cover
 *   video:  { url, public_id, thumbnail_url } | null
 */

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const MAX_IMAGE_MB = 5
const MAX_VIDEO_MB = 60

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

async function uploadToCloudinary(file, resourceType, folder, onProgress) {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { folder, timestamp }
  const { data: sig } = await axios.post("/api/cloudinary-signature", { paramsToSign })
  if (!sig?.signature) throw new Error(sig?.message || "Could not sign upload.")

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", API_KEY)
  form.append("timestamp", timestamp)
  form.append("folder", folder)
  form.append("signature", sig.signature)

  const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`, form, {
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
  })
  return data
}

const thumb = (url, t = "c_fill,w_200,h_200") => url?.replace("/upload/", `/upload/${t}/`)

export default function DeviceMediaUploader({
  images,
  setImages,
  video,
  setVideo,
  allowVideo = true,
  maxImages = 8,
  folder = "products",
  label = "Product images",
  onBusyChange,
}) {
  const imgInput = useRef(null)
  const vidInput = useRef(null)
  const [pending, setPending] = useState([]) // [{ id, name, preview, progress }]
  const [videoProgress, setVideoProgress] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)

  const handleImages = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    const room = maxImages - images.length - pending.length
    if (room <= 0) return showToast("error", `You can add up to ${maxImages} images.`)

    const valid = []
    for (const f of files.slice(0, room)) {
      if (!IMAGE_TYPES.includes(f.type)) {
        showToast("error", `${f.name}: only JPG, PNG, WEBP or AVIF images.`)
        continue
      }
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        showToast("error", `${f.name} is bigger than ${MAX_IMAGE_MB} MB.`)
        continue
      }
      valid.push(f)
    }
    if (files.length > room) showToast("error", `Only ${room} more image(s) allowed.`)

    await Promise.all(
      valid.map(async (file) => {
        const id = `${file.name}-${file.size}-${Math.random()}`
        const preview = URL.createObjectURL(file)
        setPending((p) => [...p, { id, name: file.name, preview, progress: 0 }])
        try {
          const up = await uploadToCloudinary(file, "image", folder, (progress) =>
            setPending((p) => p.map((x) => (x.id === id ? { ...x, progress } : x)))
          )
          const { data: res } = await axios.post("/api/media/create", [
            {
              asset_id: up.asset_id,
              public_id: up.public_id,
              secure_url: up.secure_url,
              path: up.secure_url,
              thumbnail_url: thumb(up.secure_url, "c_limit,h_60,w_90"),
              alt: file.name.replace(/\.[^.]+$/, ""),
              title: file.name.replace(/\.[^.]+$/, ""),
            },
          ])
          if (!res?.success) throw new Error(res?.message || "Could not save image.")
          const saved = res.data[0]
          setImages((prev) => [...prev, { _id: saved._id, url: saved.secure_url }])
        } catch (err) {
          showToast("error", `${file.name}: ${err?.response?.data?.message || err.message}`)
        } finally {
          URL.revokeObjectURL(preview)
          setPending((p) => p.filter((x) => x.id !== id))
        }
      })
    )
  }

  const handleVideo = async (file) => {
    if (!file) return
    if (!VIDEO_TYPES.includes(file.type)) return showToast("error", "Only MP4, WEBM or MOV videos.")
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return showToast("error", `Video must be under ${MAX_VIDEO_MB} MB.`)
    setVideoProgress(0)
    try {
      const up = await uploadToCloudinary(file, "video", `${folder}/videos`, setVideoProgress)
      setVideo({
        url: up.secure_url,
        public_id: up.public_id,
        thumbnail_url: up.secure_url.replace("/upload/", "/upload/so_1,c_fill,w_400,h_400/").replace(/\.[^.]+$/, ".jpg"),
      })
      showToast("success", "Video uploaded.")
    } catch (err) {
      showToast("error", err?.response?.data?.message || err.message)
    } finally {
      setVideoProgress(null)
    }
  }

  const removeImage = (id) => setImages((prev) => prev.filter((m) => m._id !== id))
  const makeCover = (i) =>
    setImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(i, 1)
      return [item, ...next]
    })
  const moveImage = (from, to) =>
    setImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })

  const uploading = pending.length > 0 || videoProgress !== null

  // Let the parent form block "Save" while files are still uploading
  useEffect(() => {
    onBusyChange?.(uploading)
  }, [uploading, onBusyChange])

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => imgInput.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (dragIndex === null) handleImages(e.dataTransfer.files)
        }}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition",
          dragOver ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "border-muted-foreground/25 hover:border-orange-400 hover:bg-orange-50/60 dark:hover:bg-orange-500/5"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:scale-110 dark:bg-orange-500/15">
          <UploadCloud className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            <span className="text-orange-600">Click to choose</span> or drag & drop {label.toLowerCase()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, WEBP, AVIF · up to {MAX_IMAGE_MB} MB each · max {maxImages} images · first image is the cover
          </p>
        </div>
        <input
          ref={imgInput}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => {
            handleImages(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {/* Image grid */}
      {(images.length > 0 || pending.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((m, i) => (
            <div
              key={m._id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (dragIndex !== null && dragIndex !== i) moveImage(dragIndex, i)
                setDragIndex(null)
              }}
              className={cn(
                "group relative aspect-square cursor-grab overflow-hidden rounded-2xl border bg-muted active:cursor-grabbing",
                i === 0 && "ring-2 ring-orange-500 ring-offset-2 ring-offset-background",
                dragIndex === i && "opacity-40"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(m.url, "c_fill,w_300,h_300")} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-center gap-1.5 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    title="Make cover"
                    onClick={() => makeCover(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 hover:bg-orange-500 hover:text-white cursor-pointer"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  title="Remove"
                  onClick={() => removeImage(m._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 hover:bg-red-500 hover:text-white cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {pending.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="h-full w-full object-cover opacity-50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                <span className="text-xs font-bold">{p.progress}%</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}

          {images.length + pending.length < maxImages && (
            <button
              type="button"
              onClick={() => imgInput.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-muted-foreground transition hover:border-orange-400 hover:text-orange-600 cursor-pointer"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Add more</span>
            </button>
          )}
        </div>
      )}

      {/* Optional video */}
      {allowVideo && (
        <div className="rounded-2xl border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-orange-600" />
              <p className="text-sm font-semibold">Product video</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                Optional
              </span>
            </div>
            <p className="text-xs text-muted-foreground">MP4, WEBM, MOV · max {MAX_VIDEO_MB} MB</p>
          </div>

          {video ? (
            <div className="relative overflow-hidden rounded-xl bg-black">
              <video src={video.url} poster={video.thumbnail_url} controls className="max-h-64 w-full object-contain" />
              <button
                type="button"
                onClick={() => setVideo(null)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-800 hover:bg-red-500 hover:text-white cursor-pointer"
                title="Remove video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : videoProgress !== null ? (
            <div className="flex items-center gap-3 rounded-xl border bg-background p-4">
              <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${videoProgress}%` }} />
                </div>
              </div>
              <span className="text-sm font-semibold">{videoProgress}%</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => vidInput.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-background py-5 text-sm font-medium text-muted-foreground transition hover:border-orange-400 hover:text-orange-600 cursor-pointer"
            >
              <Play className="h-4 w-4" /> Choose a video from your device
            </button>
          )}
          <input
            ref={vidInput}
            type="file"
            accept={VIDEO_TYPES.join(",")}
            hidden
            onChange={(e) => {
              handleVideo(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </div>
      )}

      {uploading && (
        <p className="flex items-center gap-2 text-xs font-medium text-orange-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading… please wait before saving.
        </p>
      )}
    </div>
  )
}
