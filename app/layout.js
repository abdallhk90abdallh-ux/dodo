// app/layout.js
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import Providers from "@/components/Providers";

export const metadata = {
  title: "Dodo",
  description: "A simple e-commerce site for selling bags",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="text-gray-900 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen"
      >
        <Providers>
          <CartProvider>
            <Navbar />
            <main className="flex-grow container mx-auto p-4">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
