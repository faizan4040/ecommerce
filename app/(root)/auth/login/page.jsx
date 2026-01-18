"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


import Link from "next/link";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { zSchema } from "@/lib/zodSchema";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { IMAGES } from "@/lib/images";
import { WEBSITE_REGISTER } from "@/routes/WebsiteRoute";

const Loginpage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isTypePassword, setIsTypePassword] = useState(true);

    const formSchema = zSchema.pick({
      email: true
    }).extend({
      password: z.string().min('3', 'password field is required.')
    })


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (values) => {
    setLoading(true);
    console.log("Login Data:", values);

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      {/* 🔹 Background Blur Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

      {/* 🔹 Center Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <Card className="relative w-112.5 shadow-2xl">

         
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute cursor-pointer right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Close"
          >
            <IoClose size={22} />
          </button>

          <CardContent className="space-y-6 py-8">
            {/* Logo */}
            <div className="flex justify-center">
              <img src={IMAGES.logo} alt="logo" width={50} height={50} />
            </div>

            {/* Heading */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold">Login Into Account</h1>
              <p className="text-sm text-muted-foreground">
                Login into your account by filling out the form below.
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleLoginSubmit)}
                className="space-y-6"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@gmail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={isTypePassword ? "password" : "text"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setIsTypePassword(!isTypePassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {isTypePassword ? (
                              <FaRegEye />
                            ) : (
                              <FaRegEyeSlash />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Login"
                  className="w-full bg-black text-white"
                />

                {/* Links */}
                <div className="text-center space-y-2">
                  <p>
                    Don't have an account?{" "}
                    <Link
                      href={WEBSITE_REGISTER}
                      className="text-blue-500 hover:underline"
                    >
                      create account!
                    </Link>
                  </p>

                  <Link
                    href="/auth/forget-password"
                    className="text-blue-500 hover:underline"
                  >
                    Forget Password?
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Loginpage;
