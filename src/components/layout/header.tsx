"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsMobile(
        typeof window !== "undefined" ? window.innerWidth <= 768 : false
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

function Header() {
  const isMobile = useIsMobile();
  return (
    <div>
      <Link href="/">
        <Image src="/logo.png" alt="Logo" width={150} height={150} />
      </Link>

      <NavigationMenu viewport={isMobile}>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
              <li>
                <Link href="/topic">Programming fundamentals</Link>
              </li>
              <li>
                <Link href="/category2">DSA</Link>
              </li>
              <li>
                <Link href="/category3">Web Development</Link>
              </li>
              <li>
                <Link href="/category4">Databases</Link>
              </li>
              <li>
                <Link href="/category5">DevOps</Link>
              </li>
              <li>
                <Link href="/category6">Cloud Computing</Link>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenu>
    </div>
  );
}

export default Header;
