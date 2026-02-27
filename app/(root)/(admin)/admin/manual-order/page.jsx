'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Select from '@/components/Application/Select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Manual Order' },
]

const manualOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone is required'),

  address: z.string().min(1, 'Address is required'),

  productName: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  qty: z.coerce.number().min(1),
  price: z.coerce.number().min(0),

  media: z.string().optional(),
})

  const ManualOrder = () => {
  const [loading, setLoading] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])

  const { data: getCategory } = useFetch('/api/category?deleteType=SD&&size=10000')

  useEffect(() => {
    if (getCategory?.success) {
      setCategoryOption(
        getCategory.data.map((cat) => ({ label: cat.name, value: cat._id }))
      )
    }
  }, [getCategory])

const form = useForm({
  resolver: zodResolver(manualOrderSchema),
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    address: '',
    productName: '',
    category: '',
    qty: 1,
    price: 0,
    media: '',
  },
})


const onSubmit = async (values) => {
  if (!selectedMedia.length) {
    showToast('error', 'Please select product image')
    return
  }

  setLoading(true)

  try {
    const payload = {
      ...values,
      media: selectedMedia[0].url,
    }

    const { data } = await axios.post('/api/manual-order', payload)

    if (!data.success) throw new Error(data.message)

    showToast('success', 'Manual order created successfully')
    form.reset()
    setSelectedMedia([])
  } catch (error) {
    showToast(
      'error',
      error?.response?.data?.message || error.message
    )
  } finally {
    setLoading(false)
  }
}
const [open, setOpen] = useState(false)
const [selectedMedia, setSelectedMedia] = useState([])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="py-4">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="border-b pb-3">
            <h4 className="text-xl font-semibold">Create Manual Order</h4>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Customer Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input {...field} placeholder="email@example.com" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl><Input {...field} placeholder="9876543210" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address *</FormLabel>
                        <FormControl><Input {...field} placeholder="Full delivery address" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Product Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="productName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl><Input {...field} placeholder="Nike Air Max" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <Select options={categoryOption} selected={field.value} setSelected={field.onChange} isMulti={false} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="qty" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl><Input type="number" {...field} min="1" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl><Input type="number" {...field} min="0" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    {/* ===== Product Media ===== */}
                <div className="md:col-span-2 border-dashed rounded p-5 text-center">
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />

            {selectedMedia.length > 0 && (
              <div className="flex justify-center items-center flex-wrap mb-3 gap-2">
                {selectedMedia.map(media => (
                  <div
                    key={media._id}
                    className="h-24 w-24 border rounded overflow-hidden"
                  >
                    <Image
                      src={media.url}
                      width={100}
                      height={100}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

           
            <div className="
            mt-6
            w-full
            rounded-2xl
            border border-gray-200 dark:border-gray-700
            bg-white dark:bg-background
            p-4
            shadow-sm
          ">

            {/* Upload Area */}
            <div
              onClick={() => setOpen(true)}
              className="
                cursor-pointer
                rounded-xl
                border-2 border-dashed border-gray-300
                bg-gray-50 dark:bg-card
                p-6
                text-center
                transition
                hover:border-orange-400
                hover:bg-orange-50
              "
            >
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-orange-100 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l-3 3m3-3l3 3m0-12a4 4 0 00-8 0"
                    />
                  </svg>
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Click to upload or select media
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP • Max 5 images
                </p>
              </div>
            </div>

            {/* Selected Images Preview */}
            {selectedMedia.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedMedia.map((media) => (
                  <div
                    key={media._id}
                    className="
                      group
                      relative
                      aspect-square
                      overflow-hidden
                      rounded-xl
                      border
                      bg-white
                      shadow-sm
                    "
                  >
                    <Image
                      src={media.url}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMedia(prev =>
                            prev.filter(item => item._id !== media._id)
                          )
                        }}
                        className="
                          absolute top-2 right-2
                          flex h-7 w-7 items-center justify-center
                          rounded-full
                          bg-black/60
                          text-sm
                          font-bold
                          leading-none
                          text-white
                          opacity-0
                          transition
                          group-hover:opacity-100
                          cursor-pointer
                        "
                      >
                        ×
                      </button>

                  </div>
                ))}
              </div>
            )}

          </div>

          </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <ButtonLoading loading={loading} type="submit" text="Create Manual Order" className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white" />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ManualOrder