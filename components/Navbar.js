"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, ShoppingBag, ShoppingCart, User, LogIn, LogOut, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession(); // Get session info
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home", icon: <Home size={18} /> },
    { href: "/shop", label: "Products", icon: <ShoppingBag size={18} /> },
    { href: "/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
    { href: "/cart", label: "Cart", icon: <ShoppingCart size={18} /> },
  ];

  // Show admin link only if user is admin
  if (session?.user?.role === "admin") {
    links.push({
      href: "/admin",
      label: "Admin",
      icon: <Shield size={18} />,
    });
  }

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(0,0,0,0.2)] backdrop-blur-lg backdrop-saturate-120 text-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Dodo Logo"
            width={70}
            height={70}
            className="object-contain"
            priority
          />
        </Link>

        {/* Navigation Links (desktop) */}
        <div className="hidden md:flex space-x-4 items-center">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 
                  ${
                    isActive
                      ? "text-black bg-white shadow-md scale-105"
                      : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* Auth Section (desktop) */}
          {session ? (
            <>
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                  pathname === "/profile"
                    ? "text-black bg-white shadow-md scale-105"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <User size={18} />
                <span className="font-medium">{session.user.name || "Profile"}</span>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <LogIn size={18} />
                <span className="font-medium">Login</span>
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <User size={18} />
                <span className="font-medium">Sign Up</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Toggle menu"
            className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden absolute top-full right-4 mt-2 bg-white text-black rounded-lg shadow-lg p-4 w-56 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-2 py-1 rounded ${pathname === link.href ? "bg-gray-100 font-medium" : "hover:bg-gray-100"}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-200 mt-2 pt-2">
              {session ? (
                <>
                  <Link href="/profile" className="block px-2 py-1" onClick={() => setMobileOpen(false)}>{session.user.name || "Profile"}</Link>
                  <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full text-left px-2 py-1">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-2 py-1" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/signup" className="block px-2 py-1" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
