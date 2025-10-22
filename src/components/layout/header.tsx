"use client";
import Image from "next/image";
import Link from "next/link";
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

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Memarya logo"
                width={32}
                height={32}
                className="rounded-lg shadow-sm"
              />
            </div>
            <span className="hidden text-base font-bold tracking-tight sm:inline">
              Memarya
            </span>
          </Link>

          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                  <NavigationMenuContent className="data-[motion^=from-]:anim-[enter-from-left_0.3s_ease-out] data-[motion^=from-]:sm:anim-[enter-from-right_0.3s_ease-out]">
                    <ul className="grid w-[600px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/fundamentals"
                            className="group flex h-16 w-full select-none items-center rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                              <Code className="h-5 w-5" />
                            </div>
                            <div className="text-sm leading-none">
                              <p className="font-medium">
                                Programming Fundamentals
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Start with the core building blocks
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/dsa"
                            className="group flex h-16 w-full select-none items-center rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                              <Database className="h-5 w-5" />
                            </div>
                            <div className="text-sm leading-none">
                              <p className="font-medium">DSA</p>
                              <p className="text-sm text-muted-foreground">
                                Data structures and algorithms
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/web-dev"
                            className="group flex h-16 w-full select-none items-center rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="text-sm leading-none">
                              <p className="font-medium">Web Development</p>
                              <p className="text-sm text-muted-foreground">
                                Frontend, backend, and full-stack
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/databases"
                            className="group flex h-16 w-full select-none items-center rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                              <Database className="h-5 w-5" />
                            </div>
                            <div className="text-sm leading-none">
                              <p className="font-medium">Databases</p>
                              <p className="text-sm text-muted-foreground">
                                SQL, NoSQL, and modeling
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/devops"
                            className="group flex h-16 w-full select-none items-center rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                              <Cloud className="h-5 w-5" />
                            </div>
                            <div className="text-sm leading-none">
                              <p className="font-medium">DevOps</p>
                              <p className="text-sm text-muted-foreground">
                                CI/CD, containers, and infrastructure
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/cloud"
                            className="group flex h-16 w-full select-none items-center rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                              <Cloud className="h-5 w-5" />
                            </div>
                            <div className="text-sm leading-none">
                              <p className="font-medium">Cloud Computing</p>
                              <p className="text-sm text-muted-foreground">
                                AWS, Azure, and GCP
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/community" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                      <Users className="mr-2 h-4 w-4" />
                      Community
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right: Search, Actions, Profile, Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="w-64 pl-10 pr-4 h-10"
              aria-label="Search courses"
            />
          </div>

          {/* Notifications (new) */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          <ThemeToggle />

          {/* CTA Button (new for non-logged in) */}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/start">Start Learning</Link>
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    ME
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/auth/signout" className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/fundamentals">Programming Fundamentals</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dsa">DSA</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/web-dev">Web Development</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/databases">Databases</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/devops">DevOps</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/cloud">Cloud Computing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/community">Community</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/start" className="w-full">
                  Start Learning
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
