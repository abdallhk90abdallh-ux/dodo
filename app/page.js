"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [heroTitle, setHeroTitle] = useState("Premium Bags for Every Journey");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Discover our collection of handcrafted bags designed for style and functionality."
  );
  const [heroImage, setHeroImage] = useState("");
  const [heroImageEnabled, setHeroImageEnabled] = useState(false);
  const [heroImageWidth, setHeroImageWidth] = useState(224);
  const [heroImageHeight, setHeroImageHeight] = useState(0);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setFeatured(data.slice(0, 4));
      })
      .catch((err) =>
        console.error("Failed to load featured products:", err)
      );

    fetch("/api/settings")
      .then((res) => res.json())
      .then((s) => {
        if (s) {
          if (s.heroTitle) setHeroTitle(s.heroTitle);
          if (s.heroSubtitle) setHeroSubtitle(s.heroSubtitle);
          if (s.heroImage) setHeroImage(s.heroImage);
          setHeroImageEnabled(!!s.heroImageEnabled);
          if (s.heroImageWidth) setHeroImageWidth(s.heroImageWidth);
          if (s.heroImageHeight) setHeroImageHeight(s.heroImageHeight);
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white rounded-xl">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between">
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left mb-10 lg:mb-0">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
            {heroTitle.split(" ")[0]}{" "}
            <span className="text-blue-600">
              {heroTitle.split(" ").slice(1).join(" ")}
            </span>
          </h1>

          {/* Optional Hero Image */}
          {heroImageEnabled && heroImage ? (
            <img
              src={heroImage}
              alt="Hero"
              style={{
                width: heroImageWidth
                  ? `${heroImageWidth}px`
                  : undefined,
                height: heroImageHeight
                  ? `${heroImageHeight}px`
                  : "auto",
                maxWidth: "100%",
              }}
              className="object-cover rounded-lg mx-auto my-4 shadow-md"
            />
          ) : null}

          <p className="text-lg text-gray-600 max-w-xl">
            {heroSubtitle}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link
              href="/shop"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-300"
            >
              Shop Now
            </Link>

            <Link
              href="/shop"
              className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-900 hover:text-white transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="flex gap-6 justify-center lg:justify-start pt-2">
            <a
              href="https://www.facebook.com/share/1EnDCrZDMy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-all duration-300 text-3xl hover:scale-110"
            >
              <FaFacebook />
            </a>

            <a
              href="https://www.instagram.com/dodo79611dodo?igsh=ejRnb2QyZXlleWo="
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600 transition-all duration-300 text-3xl hover:scale-110"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.linkedin.com/in/abdallah-ayman-0a8233335?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-700 transition-all duration-300 text-3xl hover:scale-110"
            >
              <FaLinkedin />
            </a>

            <a
              href="https://wa.me/message/HRIPYHYIE6YVP1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-green-600 transition-all duration-300 text-3xl hover:scale-110"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>

        {/* Right Content - Featured Products */}
        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
          {featured.length > 0 ? (
            featured.map((product) => (
              <div
                key={product._id}
                className="relative h-48 lg:h-64 rounded-2xl overflow-hidden group"
              >
                <img
                  src={
                    product.images?.[0] ||
                    product.image ||
                    "/bag-placeholder.jpg"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />

                <p className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow">
                  {product.name}
                </p>
              </div>
            ))
          ) : (
            Array(4)
              .fill()
              .map((_, i) => (
                <div
                  key={i}
                  className="h-48 lg:h-64 rounded-2xl bg-gray-200 animate-pulse"
                />
              ))
          )}
        </div>
      </section>
    </div>
  );
}