"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User, LogIn, LogOut, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession(); // Get session info

  const links = [
    { href: "/", label: "Home", icon: <Home size={18} /> },
    { href: "/shop", label: "Products", icon: <ShoppingBag size={18} /> },
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

        {/* Navigation Links */}
        <div className="flex space-x-[1rem] items-center">
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

          {/* Auth Section */}
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
      </div>
    </nav>
  );
}
