"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import ButtonLoading from "@/components/application/buttonLoading";
import { showToast } from "@/lib/showToast";

const formSchema = z
  .object({
    name: z.string().min(1, "Full name required"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(16, "Phone number is too long"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmitRegister = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/auth/register",
        {
          name: data.name,
          phone: data.phone,
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      //console.log("Registration Success:", response.data);
      showToast("success", response.data?.message || "Registration successful.");

      router.push("/auth/login");
    } catch (err: unknown) {
      let message = "Registration failed";

      if (axios.isAxiosError(err)) {
        message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message;
      }

      setError(message);
      showToast("error", message);
      //console.error("Registration Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="flex justify-center items-center min-h-screen px-4 sm:px-6">
  <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 w-full max-w-md boxshadow-lg">
    {/* Logo */}
    <div className="flex justify-center mb-4">
      <Image
        src="/assets/images/logo-black1.png"
        alt="E-commerce Logo"
        width={200}
        height={100}
        priority
        style={{ height: "auto" }}
        className="max-w-[150px] sm:max-w-[200px]"
      />
    </div>

    {/* Heading */}
    <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
      Create Account
    </h1>

    <p className="text-center text-xs sm:text-sm mb-4">
      <span className="text-black-600 px-2 py-1 rounded">
        Create new account by filling out the form below.
      </span>
    </p>

    <form
      onSubmit={form.handleSubmit(handleSubmitRegister)}
      className="space-y-3 sm:space-y-4"
    >
      {/* Full Name */}
      <div>
        <label className="text-sm sm:text-base">Full Name</label>
        <input
          {...form.register("name")}
          placeholder="Enter your name"
          className="w-full border rounded px-3 py-2 mt-1 text-sm sm:text-base"
        />
        {form.formState.errors.name && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm sm:text-base">Mobile Number</label>
        <input
          type="tel"
          {...form.register("phone")}
          placeholder="+91 98765 43210"
          className="w-full border rounded px-3 py-2 mt-1 text-sm sm:text-base"
        />
        {form.formState.errors.phone && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="text-sm sm:text-base">Email</label>
        <input
          type="email"
          {...form.register("email")}
          placeholder="example@gmail.com"
          className="w-full border rounded px-3 py-2 mt-1 text-sm sm:text-base"
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="text-sm sm:text-base">Password</label>
        <input
          type="password"
          {...form.register("password")}
          placeholder="******"
          className="w-full border rounded px-3 py-2 mt-1 text-sm sm:text-base"
        />
        {form.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="text-sm sm:text-base">Confirm Password</label>
        <input
          type="password"
          {...form.register("confirmPassword")}
          placeholder="******"
          className="w-full border rounded px-3 py-2 mt-1 text-sm sm:text-base"
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}

      {/* Submit Button */}
      <ButtonLoading
        type="submit"
        loading={loading}
        text="Create Account"
        className="cursor-pointer w-full text-sm sm:text-base py-2 sm:py-3"
      />

      {/* Login Link */}
      <p className="text-center text-xs sm:text-sm mt-2">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-secondary underline"
        >
          Login
        </Link>
      </p>
    </form>
  </div>
</div>
  );
}