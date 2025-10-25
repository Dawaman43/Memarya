"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, BookOpen, ImageIcon, Users, Clock } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: string;
  durationMinutes?: number | null;
  studentCount?: number | null;
};

function formatDuration(minutes: number) {
  const m = Number(minutes) || 0;
  if (m <= 0) return "TBD";
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  if (hrs > 0) return `${hrs}h${mins > 0 ? ` ${mins}m` : ""}`;
  return `${mins}m`;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams?.get("category") ?? "all";

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/courses", { cache: "no-store" });
      const data = await res.json();
      const allCourses = data.courses || [];
      setCourses(allCourses);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(allCourses.map((c: Course) => c.category))
      ).sort() as string[];
      setCategories(uniqueCategories);

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (course) =>
          course.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  }, [courses, activeCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/courses?${params.toString()}`);
  };

  const CourseCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No courses found</h3>
      <p className="text-muted-foreground max-w-sm">
        {searchQuery
          ? "Try adjusting your search query or filters."
          : "No courses are available in this category yet."}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground mt-1">
              Discover and learn from our collection of courses
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <TabsTrigger value="all" className="text-xs">
            All Courses
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category.toLowerCase()}
              className="text-xs"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs">
                        {course.category}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {course.durationMinutes &&
                            course.durationMinutes > 0
                              ? formatDuration(course.durationMinutes)
                              : "TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {typeof course.studentCount === "number" &&
                            course.studentCount > 0
                              ? `${course.studentCount}`
                              : "TBD"}
                          </span>
                        </div>
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="transition-all duration-200"
                      >
                        <Link href={`/courses/${course.id}`}>View Course</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
