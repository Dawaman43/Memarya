"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Home,
  Code,
  Database,
  Cloud,
  Users,
  BookOpen,
  Bell,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

function Header({ user }: HeaderProps) {
  // Live session from better-auth (client)
  const router = useRouter();
  const { data: session } = useSession();
  const sessionUser = (session as any)?.user as
    | { name?: string; email?: string; image?: string }
    | undefined;

  // Prefer live session user over prop; prop can be used for SSR fallback
  const currentUser = user ?? sessionUser;
  const userInitial =
    currentUser?.name?.charAt(0)?.toUpperCase() ||
    currentUser?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="shrink-0">
          <Link
            href="/"
            className="group flex items-center gap-2 hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Memarya logo"
                width={36}
                height={36}
                className="rounded-xl shadow-sm"
              />
              <div className="absolute inset-0 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="hidden text-lg font-extrabold tracking-tight sm:inline">
              Memarya
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="flex-1 flex justify-center">
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group flex h-10 items-center justify-center px-3 rounded-lg text-sm font-medium transition-colors">
                    Explore
                    <Sparkles className="ml-1 h-4 w-4 group-data-[state=open]:rotate-12 transition-transform" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="data-[motion^=from-]:anim-[enter-from-left_0.4s_cubic-bezier(0.4,0,0.2,1)] data-[motion^=from-]:sm:anim-[enter-from-right_0.4s_cubic-bezier(0.4,0,0.2,1)] backdrop-blur-xl border rounded-xl shadow-lg left-1/2 -translate-x-1/2">
                    <ul className="grid w-[600px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/fundamentals"
                            className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors"
                          >
                            <div className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md">
                              <Code className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Programming Fundamentals
                              </p>
                              <p className="line-clamp-2 text-sm">
                                Master the core building blocks of code
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/dsa"
                            className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors"
                          >
                            <div className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md">
                              <Database className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Data Structures & Algorithms
                              </p>
                              <p className="line-clamp-2 text-sm">
                                Optimize your problem-solving skills
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/web-dev"
                            className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors"
                          >
                            <div className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Web Development
                              </p>
                              <p className="line-clamp-2 text-sm">
                                Build stunning sites from frontend to backend
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/databases"
                            className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors"
                          >
                            <div className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md">
                              <Database className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Databases
                              </p>
                              <p className="line-clamp-2 text-sm">
                                Design and query powerful data systems
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/devops"
                            className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors"
                          >
                            <div className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md">
                              <Cloud className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                DevOps
                              </p>
                              <p className="line-clamp-2 text-sm">
                                Streamline deployment with CI/CD mastery
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/cloud"
                            className="group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors"
                          >
                            <div className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md">
                              <Cloud className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Cloud Computing
                              </p>
                              <p className="line-clamp-2 text-sm">
                                Conquer AWS, Azure, and GCP like a pro
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right: Search, Actions, Profile, Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search courses & topics..."
              className="w-72 pl-10 pr-4 h-10 rounded-lg backdrop-blur-sm"
              aria-label="Search courses"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive animate-ping" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <ThemeToggle />

          {/* CTA Button or Profile */}
          {!currentUser ? (
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex rounded-lg px-4 font-semibold"
            >
              <Link href="/auth">Start Learning</Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-lg transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={currentUser.image}
                      alt={currentUser.name || "User"}
                    />
                    <AvatarFallback className="font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 backdrop-blur-xl border rounded-xl shadow-lg"
              >
                <DropdownMenuLabel className="font-normal px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs leading-none">{currentUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={async (e) => {
                    e.preventDefault();
                    try {
                      await signOut();
                      // Ensure UI and any SSR boundaries reflect the new state
                      router.replace("/auth");
                      router.refresh();
                    } catch (err) {
                      console.error("Sign out failed", err);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="md:hidden h-9 w-9 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={10}
              align="end"
              className="w-56 backdrop-blur-xl border rounded-xl shadow-lg"
            >
              <DropdownMenuLabel className="px-4 py-3 font-medium">
                Navigation
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center w-full">
                  <Home className="mr-2 h-4 w-4" /> Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/fundamentals" className="flex items-center w-full">
                  <Code className="mr-2 h-4 w-4" /> Programming Fundamentals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dsa" className="flex items-center w-full">
                  <Database className="mr-2 h-4 w-4" /> DSA
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/web-dev" className="flex items-center w-full">
                  <BookOpen className="mr-2 h-4 w-4" /> Web Development
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/databases" className="flex items-center w-full">
                  <Database className="mr-2 h-4 w-4" /> Databases
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/devops" className="flex items-center w-full">
                  <Cloud className="mr-2 h-4 w-4" /> DevOps
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cloud" className="flex items-center w-full">
                  <Cloud className="mr-2 h-4 w-4" /> Cloud Computing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/community" className="flex items-center w-full">
                  <Users className="mr-2 h-4 w-4" /> Community
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {currentUser ? (
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center rounded-md font-medium"
                  >
                    <Home className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link
                    href="/auth"
                    className="w-full flex items-center justify-center rounded-md font-medium"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Start Learning
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
