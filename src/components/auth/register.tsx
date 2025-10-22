"use client";
import { authClient, signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

type RegisterData = z.infer<typeof registerSchema>;

function Register() {
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterData) {
    const { d, e } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (e) {
      toast.error(`Registration failed: ${e.message}`);
      return;
    }

    toast.success(
      "Registration successful! Please check your email to verify."
    );

    console.log("Register data:", data);
  }

  return <div>register</div>;
}

export default Register;
