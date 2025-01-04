"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Navbar() {
  const pathname = usePathname();
  return <div className="container mx-auto p-4 flex justify-between items-center">
    <Link href="/">
      {pathname !== '/' ? <h1 className="text-2xl font-bold">Infinite Cookbook</h1> : <></>}
    </Link>
    <div className="flex gap-4">
      <Link href="/history">History</Link>
      <Link href="/preferences">Preferences</Link>
    </div>
  </div>;
}
