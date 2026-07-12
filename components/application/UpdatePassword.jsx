"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import ButtonLoading from "@/components/application/buttonLoading";
import { showToast } from "@/lib/showToast";

const formSchema = z
  .object({
    email:true,
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function UpdatePassword() {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
     email:email,
      password: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleUpdatePassword = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/auth/forget-password/update-password",
        {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      form.reset()
      //console.log("Registration Success:", response.data);
      showToast("success", response.data?.message || "Password Update successful.");

      router.push(WEBSITE_LOGIN);
    } catch (err: unknown) {
      let message = "Password Update failed";

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
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-6 w-[450px] boxshawdow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/assets/images/logo-black1.png"
            alt="E-commerce Logo"
            width={200}
            height={100}
            priority
            style={{ height: "auto" }}
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center mb-2">
         Update Password
        </h1>

        <p className="text-center text-sm mb-4">
          <span className="text-black-600 px-2 py-1 rounded">
            Create new Update Password by filling out the form below.
          </span>
        </p>

        <form
          onSubmit={form.handleSubmit(handleUpdatePassword)}
          className="space-y-3"
        >
        
          {/* Password */}
          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              {...form.register("password")}
              placeholder="******"
              className="w-full border rounded px-3 py-2 mt-1"
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm">Confirm Password</label>
            <input
              type="password"
              {...form.register("confirmPassword")}
              placeholder="******"
              className="w-full border rounded px-3 py-2 mt-1"
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
            text="Update Password"
            className="cursor-pointer"
          />
        </form>
      </div>
    </div>
  );
}