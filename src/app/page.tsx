"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlayCircle,
  Rocket,
  BookOpen,
  Award,
  Code2,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string;
};

type CategoryCount = {
  category: string;
  count: number;
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>("all");
  const topCategories = useMemo(() => {
    // show top 6 plus "all"
    const top = categories.slice(0, 6).map((c) => c.category);
    return ["all", ...top.filter((c, i, a) => a.indexOf(c) === i)];
  }, [categories]);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/courses/categories", {
          cache: "no-store",
        });
        const data = await res.json();
        setCategories(data.categories || []);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  // Load courses for selected category
  useEffect(() => {
    setLoading(true);
    (async () => {
      const qs =
        activeCat && activeCat !== "all"
          ? `?category=${encodeURIComponent(activeCat)}`
          : "";
      const res = await fetch(`/api/courses${qs}`, { cache: "no-store" });
      const data = await res.json();
      setCourses((data.courses as Course[]) || []);
      setLoading(false);
    })();
  }, [activeCat]);

  return (
    <div className="relative">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute left-1/2 -top-40 h-120 w-120 -translate-x-1/2 rounded-full bg-linear-to-r from-blue-500/20 to-cyan-400/20 blur-3xl"
          initial={{ opacity: 0.2, scale: 0.9 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute -right-40 -bottom-32 h-104 w-104 rounded-full bg-linear-to-r from-purple-500/20 to-pink-400/20 blur-3xl"
          initial={{ opacity: 0.2, scale: 0.9 }}
          animate={{ opacity: 0.45, scale: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <motion.h1
              className="text-4xl font-bold tracking-tight md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Learn by Building, Level Up Faster
            </motion.h1>
            <motion.p
              className="mt-4 text-lg text-muted-foreground md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Hands-on courses, integrated IDE, progress tracking, and
              certificates — all in one place.
            </motion.p>
            <motion.div
              className="mt-6 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button asChild size="lg">
                <Link href="/courses">
                  <Sparkles className="mr-2 h-5 w-5" /> Browse Courses
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/ide">
                  <Code2 className="mr-2 h-5 w-5" /> Try the IDE
                </Link>
              </Button>
              <Badge variant="secondary" className="ml-1">
                New content weekly
              </Badge>
            </motion.div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center md:max-w-md">
              {[
                { label: "Learners", value: "10k+" },
                { label: "Projects", value: "120+" },
                { label: "Certificates", value: "5k+" },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="py-4">
                    <div className="text-2xl font-semibold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-background shadow-lg">
              <div className="absolute inset-0 grid place-items-center">
                <PlayCircle className="h-16 w-16 opacity-60" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="rounded-md bg-black/40 p-2 text-sm text-white backdrop-blur">
                  Quick tour: Explore courses, code in the browser, and get
                  certified.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">
            Everything you need to succeed
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Rocket className="h-5 w-5" />,
              title: "Guided Learning",
              desc: "Structured paths from beginner to pro.",
            },
            {
              icon: <Code2 className="h-5 w-5" />,
              title: "Built-in IDE",
              desc: "Practice in the browser with real code.",
            },
            {
              icon: <Award className="h-5 w-5" />,
              title: "Certificates",
              desc: "Showcase your achievements and skills.",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Community",
              desc: "Share ideas and get help fast.",
            },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-linear-to-r from-blue-500/15 to-purple-500/15 text-primary">
                    {f.icon}
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {f.desc}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories + Featured */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Courses</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">View all</Link>
          </Button>
        </div>
        <Tabs value={activeCat} onValueChange={(v) => setActiveCat(v)}>
          <TabsList className="flex flex-wrap">
            {(catLoading ? ["all"] : topCategories).map((c) => (
              <TabsTrigger key={c} value={c} className="capitalize">
                {c}
                {c !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {categories.find((x) => x.category === c)?.count ?? 0}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeCat} className="mt-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-2/3" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-9 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.length === 0 ? (
                  <div className="col-span-full rounded-md border p-6 text-center text-muted-foreground">
                    No courses found in this category.
                  </div>
                ) : (
                  courses.slice(0, 6).map((c) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35 }}
                    >
                      <Card className="h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-lg line-clamp-1">
                              {c.title}
                            </CardTitle>
                            <Badge variant="secondary" className="capitalize">
                              {c.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {c.description && (
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                              {c.description}
                            </p>
                          )}
                          <Button asChild size="sm">
                            <Link href={`/courses/${c.id}`}>
                              Start <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Loved by learners</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Amina",
              quote:
                "The built-in IDE and bite-sized lessons helped me land my first dev job.",
            },
            {
              name: "Yusuf",
              quote:
                "Clear paths and great projects. The certificates boosted my portfolio!",
            },
            {
              name: "Sara",
              quote:
                "I learn faster when I build. This platform makes it fun and practical.",
            },
          ].map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
            >
              <Card className="h-full">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-r from-blue-500/15 to-purple-500/15">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="font-medium">{t.name}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">“{t.quote}”</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-14">
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-blue-600/10 to-purple-600/10" />
            <CardHeader>
              <CardTitle className="text-2xl">
                Ready to start learning?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-muted-foreground">
                Join thousands leveling up with hands-on courses.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/courses">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/auth">Create account</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>
    </div>
  );
}
