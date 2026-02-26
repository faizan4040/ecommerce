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

/* ---------------- Breadcrumb ---------------- */
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Manual Order' },
]

/* ---------------- Zod Schema ---------------- */
const manualOrderSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number required'),
  address: z.string().min(1, 'Address is required'),

  productName: z.string().min(1, 'Product name required'),
  category: z.string().min(1, 'Category required'),

  qty: z.coerce.number().min(1, 'Minimum quantity is 1'),
  price: z.coerce.number().min(0, 'Price must be positive'),

  media: z.string().url('Invalid image URL').optional().or(z.literal('')),
})

/* ---------------- Component ---------------- */
const ManualOrder = () => {
  const [loading, setLoading] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])

  /* -------- Fetch Categories -------- */
  const { data: getCategory } = useFetch(
    '/api/category?deleteType=SD&&size=10000'
  )

  useEffect(() => {
    if (getCategory?.success) {
      setCategoryOption(
        getCategory.data.map((cat) => ({
          label: cat.name,
          value: cat._id,
        }))
      )
    }
  }, [getCategory])

  /* -------- Form Setup -------- */
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

  /* -------- Submit -------- */
  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/orders/manual', values)

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to create order')
      }

      showToast('success', 'Manual order created successfully')
      form.reset()
    } catch (error) {
      showToast(
        'error',
        error?.response?.data?.message || error.message
      )
    } finally {
      setLoading(false)
    }
  }

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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* ================= Customer Info ================= */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Customer Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="john@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Full delivery address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ================= Product Info ================= */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Product Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nike Air Max"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <FormControl>
                            <Select
                              options={categoryOption}
                              selected={field.value}
                              setSelected={field.onChange}
                              isMulti={false}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="qty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* -------- Media -------- */}
                    <FormField
                      control={form.control}
                      name="media"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Product Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://image-url.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* ================= Submit ================= */}
                <div className="pt-4 border-t">
                  <ButtonLoading
                    loading={loading}
                    type="submit"
                    text="Create Manual Order"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  />
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