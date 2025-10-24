"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]),
});

type CreateUserData = z.infer<typeof createUserSchema>;

type User = {
  id: string;
  name: string | null;
  email: string;
  role?: string | null;
};

export default function AdminUsersPage() {
  const form = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await authClient.admin.listUsers({
        query: { limit: 50 },
      });
      if (error) throw new Error(error.message);
      setUsers(data?.users ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Failed to load users: ${msg}`);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onCreate = async (values: CreateUserData) => {
    try {
      setLoading(true);
      const { error } = await authClient.admin.createUser({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        name: values.name.trim(),
        role: values.role,
      });
      if (error) throw new Error(error.message);
      toast.success("User created");
      form.reset({ name: "", email: "", password: "", role: "user" });
      await loadUsers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Create failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (userId: string) => {
    try {
      const { error } = await authClient.admin.setRole({
        userId,
        role: "admin",
      });
      if (error) throw new Error(error.message);
      toast.success("Role updated to admin");
      await loadUsers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Set role failed: ${msg}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCreate)}
              className="grid gap-3 md:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
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
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
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
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="user or admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users {refreshing ? "(loading...)" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground">No users found.</p>
            )}
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 py-2 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <div className="font-medium">{u.name || "(no name)"}</div>
                  <div className="text-sm text-muted-foreground">{u.email}</div>
                </div>
                <div className="text-sm">{u.role || "user"}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => makeAdmin(u.id)}
                >
                  Make Admin
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
