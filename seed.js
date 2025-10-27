require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const Product = require("./lib/models/Product");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await Product.create([
      {
        name: "Stylish Backpack",
        price: 200,
        image: "https://images.contentstack.io/v3/assets/bltcedd8dbd5891265b/blt4a4af7e6facea579/6668df6ceca9a600983250ac/beautiful-flowers-hero.jpg?q=70&width=640&auto=webp",
        description: "Elegant leather handbag for everyday use.",
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80"
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
      }
    ]);

    console.log("✅ Added sample products");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
