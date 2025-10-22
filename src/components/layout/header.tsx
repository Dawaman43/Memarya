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

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b bg-gradient-to-r from-background/95 via-background/80 to-background/95 supports-[backdrop-filter]:bg-gradient-to-r from-background/60 via-background/40 to-background/60 shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <div className="relative animate-pulse-once">
              <Image
                src="/logo.png"
                alt="Memarya logo"
                width={36}
                height={36}
                className="rounded-xl shadow-lg ring-1 ring-primary/20"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="hidden text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent sm:inline">
              Memarya
            </span>
          </Link>

          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-xl bg-background/50 px-4 py-2 text-sm font-semibold transition-all duration-300 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none focus:shadow-lg data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/50">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group h-10 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:bg-accent/80 hover:shadow-md hover:scale-105 data-[state=open]:bg-accent/80 data-[state=open]:shadow-md">
                    Explore
                    <Sparkles className="ml-1 h-4 w-4 text-primary group-hover:rotate-12 transition-transform" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="data-[motion^=from-]:anim-[enter-from-left_0.4s_cubic-bezier(0.4,0,0.2,1)] data-[motion^=from-]:sm:anim-[enter-from-right_0.4s_cubic-bezier(0.4,0,0.2,1)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                    <ul className="grid w-[650px] gap-4 p-6 md:w-[550px] md:grid-cols-2 lg:w-[650px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/fundamentals"
                            className="group flex h-20 w-full select-none items-center rounded-xl p-4 no-underline outline-none transition-all duration-300 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:shadow-xl hover:scale-105 focus:bg-accent/50 focus:shadow-xl data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/30 hover:border-primary/30"
                          >
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-background to-background/50 shadow-md group-hover:shadow-primary/20 group-hover:scale-110 transition-all">
                              <Code className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-sm leading-tight">
                              <p className="font-bold text-foreground">
                                Programming Fundamentals
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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
                            className="group flex h-20 w-full select-none items-center rounded-xl p-4 no-underline outline-none transition-all duration-300 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:shadow-xl hover:scale-105 focus:bg-accent/50 focus:shadow-xl data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/30 hover:border-primary/30"
                          >
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-background to-background/50 shadow-md group-hover:shadow-primary/20 group-hover:scale-110 transition-all">
                              <Database className="h-6 w-6 text-secondary" />
                            </div>
                            <div className="text-sm leading-tight">
                              <p className="font-bold text-foreground">
                                Data Structures & Algorithms
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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
                            className="group flex h-20 w-full select-none items-center rounded-xl p-4 no-underline outline-none transition-all duration-300 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:shadow-xl hover:scale-105 focus:bg-accent/50 focus:shadow-xl data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/30 hover:border-primary/30"
                          >
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-background to-background/50 shadow-md group-hover:shadow-primary/20 group-hover:scale-110 transition-all">
                              <BookOpen className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="text-sm leading-tight">
                              <p className="font-bold text-foreground">
                                Web Development
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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
                            className="group flex h-20 w-full select-none items-center rounded-xl p-4 no-underline outline-none transition-all duration-300 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:shadow-xl hover:scale-105 focus:bg-accent/50 focus:shadow-xl data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/30 hover:border-primary/30"
                          >
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-background to-background/50 shadow-md group-hover:shadow-primary/20 group-hover:scale-110 transition-all">
                              <Database className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="text-sm leading-tight">
                              <p className="font-bold text-foreground">
                                Databases
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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
                            className="group flex h-20 w-full select-none items-center rounded-xl p-4 no-underline outline-none transition-all duration-300 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:shadow-xl hover:scale-105 focus:bg-accent/50 focus:shadow-xl data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/30 hover:border-primary/30"
                          >
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-background to-background/50 shadow-md group-hover:shadow-primary/20 group-hover:scale-110 transition-all">
                              <Cloud className="h-6 w-6 text-indigo-500" />
                            </div>
                            <div className="text-sm leading-tight">
                              <p className="font-bold text-foreground">
                                DevOps
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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
                            className="group flex h-20 w-full select-none items-center rounded-xl p-4 no-underline outline-none transition-all duration-300 hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30 hover:shadow-xl hover:scale-105 focus:bg-accent/50 focus:shadow-xl data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/30 hover:border-primary/30"
                          >
                            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-gradient-to-br from-background to-background/50 shadow-md group-hover:shadow-primary/20 group-hover:scale-110 transition-all">
                              <Cloud className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="text-sm leading-tight">
                              <p className="font-bold text-foreground">
                                Cloud Computing
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Conquer AWS, Azure, and GCP like a pro
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
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-xl bg-background/50 px-4 py-2 text-sm font-semibold transition-all duration-300 hover:bg-accent/80 hover:text-accent-foreground hover:shadow-md hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none focus:shadow-lg data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 border border-border/50">
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
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses & topics..."
              className="w-72 pl-10 pr-4 h-10 rounded-xl border-border/50 bg-background/80 backdrop-blur-sm ring-1 ring-border/20 focus:ring-primary/30 transition-all"
              aria-label="Search courses"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent/50 transition-all duration-300 hover:scale-110"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive animate-ping"></span>
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          <ThemeToggle />

          {/* CTA Button */}
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 rounded-xl px-6 font-semibold"
          >
            <Link href="/start">Start Learning</Link>
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent/50 transition-all duration-300 hover:scale-110"
              >
                <Avatar className="h-9 w-9 ring-2 ring-border/50">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                    ME
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl"
            >
              <DropdownMenuLabel className="font-normal px-4 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/dashboard" className="flex items-center w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/profile" className="flex items-center w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/settings" className="flex items-center w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer focus:bg-destructive/50 text-destructive"
              >
                <Link href="/auth/signout" className="flex items-center w-full">
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
                className="md:hidden hover:bg-accent/50 transition-all duration-300 hover:scale-110"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={10}
              align="end"
              className="w-64 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl"
            >
              <DropdownMenuLabel className="px-4 py-3 font-semibold">
                Navigation
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/" className="flex items-center w-full">
                  <Home className="mr-2 h-4 w-4" /> Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/fundamentals" className="flex items-center w-full">
                  <Code className="mr-2 h-4 w-4" /> Programming Fundamentals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/dsa" className="flex items-center w-full">
                  <Database className="mr-2 h-4 w-4" /> DSA
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/web-dev" className="flex items-center w-full">
                  <BookOpen className="mr-2 h-4 w-4" /> Web Development
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/databases" className="flex items-center w-full">
                  <Database className="mr-2 h-4 w-4" /> Databases
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/devops" className="flex items-center w-full">
                  <Cloud className="mr-2 h-4 w-4" /> DevOps
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/cloud" className="flex items-center w-full">
                  <Cloud className="mr-2 h-4 w-4" /> Cloud Computing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-4 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Link href="/community" className="flex items-center w-full">
                  <Users className="mr-2 h-4 w-4" /> Community
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="px-4 py-3 mt-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-lg font-semibold">
                <Link
                  href="/start"
                  className="w-full flex items-center justify-center"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Start Learning
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
