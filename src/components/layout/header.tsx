"use client";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
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
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90">
            <Image
              src="/logo.png"
              alt="Memarya logo"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="hidden text-sm font-semibold sm:inline">
              Memarya
            </span>
          </Link>

          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-2 p-3 md:w-[420px] lg:w-[520px] lg:grid-cols-2">
                      <li>
                        <Link
                          href="/topic"
                          className="block rounded-md p-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">
                            Programming fundamentals
                          </span>
                          <p className="text-muted-foreground text-xs">
                            Start with the core building blocks
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/category2"
                          className="block rounded-md p-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">DSA</span>
                          <p className="text-muted-foreground text-xs">
                            Data structures and algorithms
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/category3"
                          className="block rounded-md p-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">
                            Web Development
                          </span>
                          <p className="text-muted-foreground text-xs">
                            Frontend, backend, and full‑stack
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/category4"
                          className="block rounded-md p-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">Databases</span>
                          <p className="text-muted-foreground text-xs">
                            SQL, NoSQL, and modeling
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/category5"
                          className="block rounded-md p-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">DevOps</span>
                          <p className="text-muted-foreground text-xs">
                            CI/CD, containers, and infra
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/category6"
                          className="block rounded-md p-2 hover:bg-accent"
                        >
                          <span className="text-sm font-medium">
                            Cloud Computing
                          </span>
                          <p className="text-muted-foreground text-xs">
                            AWS, Azure, and GCP
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right: Search, Theme, Profile, Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search (hidden on very small screens) */}
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-40 pl-8 sm:w-56"
              aria-label="Search"
            />
          </div>

          <ThemeToggle />

          {/* Profile dropdown (placeholder) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="size-6">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/auth">Sign in</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Explore</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/topic">Programming fundamentals</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category2">DSA</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category3">Web Development</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category4">Databases</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category5">DevOps</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/category6">Cloud Computing</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
