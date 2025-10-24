"use client";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiKey } from "react-icons/fi";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
    // Invite code is required only for bootstrap (non-admin)
    inviteCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user?.role ?? "") === "admin";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      inviteCode: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    try {
      setSubmitting(true);
      const name = values.name.trim();
      const email = values.email.trim().toLowerCase();
      const password = values.password;

      if (isAdmin) {
        // Admin creating another admin via Better Auth admin plugin
        const { error } = await authClient.admin.createUser({
          email,
          password,
          name,
          role: "admin",
        });
        if (error) {
          toast.error(`Create admin failed: ${error.message}`);
          return;
        }
        toast.success("Admin created successfully.");
        router.push("/admin/users");
        return;
      }

      // Bootstrap path for first admin: requires invite code and uses server API
      if (!values.inviteCode?.trim()) {
        toast.error("Invite code is required");
        return;
      }
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          inviteCode: values.inviteCode.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error ? JSON.stringify(data.error) : res.statusText;
        toast.error(`Admin registration failed: ${msg}`);
        return;
      }

      // Auto-login the admin
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        toast.success(
          "Admin created. Please login manually with your credentials."
        );
        router.push("/auth");
        return;
      }

      toast.success("Admin account created and signed in.");
      router.push("/admin/courses");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e ?? "Unknown error");
      toast.error(`Unexpected error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Registration</CardTitle>
          <CardDescription>
            Create an administrator account using your invite code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                          placeholder="Enter your full name"
                          className="pl-9"
                          {...field}
                        />
                      </div>
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
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-9 pr-9"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-9 pr-9"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                        >
                          {showConfirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isAdmin && (
                <FormField
                  control={form.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Invite Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                          <Input
                            type="text"
                            placeholder="Enter the invite code"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Admin"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
