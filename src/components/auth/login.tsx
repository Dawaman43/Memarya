"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginData = z.infer<typeof loginSchema>;
function Login() {
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    try {
      setLoading(true);
      const { data: resData, error: resError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
    } catch (error) {}
  };
  return <div>login</div>;
}

export default Login;
