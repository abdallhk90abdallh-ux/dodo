
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

// ============================================================================
// QUICK CONNECTION TEST
// ============================================================================

// Test basic connection with server validation
async function testConnection() {
  const uri = process.env.MONGODB_URI;
  const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Pinged your deployment. Connection successful!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Read MongoDB URI from environment or use fallback
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI not found in .env.local");
  console.error("   Add this line to .env.local:");
  console.error("   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0");
  process.exit(1);
}

// Database and collection configuration
const DATABASE_NAME = "ecommerce";
const COLLECTION_NAME = "products";

// ============================================================================
// DEFINE SCHEMA
// ============================================================================

// Define a simple schema for example documents
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    inStock: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }, // Timestamp field
  },
  { collection: COLLECTION_NAME }
);

// Create a model for the schema
const Product = mongoose.model("Product", productSchema);

// ============================================================================
// HELPER FUNCTION: Pretty-print documents
// ============================================================================

function printDocument(doc, label) {
  console.log(`\n[${label}]`);
  console.log(JSON.stringify(doc, null, 2));
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function runExample() {
  try {
    // Step 1: Connect to MongoDB Atlas
    console.log("\n📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
      // Mongoose will handle connection pooling and retries automatically
    });
    console.log("✅ Connected successfully!");

    // Step 2: Clear old data (optional - for fresh runs)
    console.log("\n🗑️  Clearing old documents...");
    await Product.deleteMany({});
    console.log("✅ Cleared.");

    // Step 3: Insert 10 sample documents with realistic data and varying timestamps
    console.log("\n📝 Inserting 10 sample products...");
    const sampleProducts = [
      {
        name: "Leather Backpack",
        price: 79.99,
        category: "backpacks",
        description: "Durable leather backpack for everyday use",
        inStock: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        name: "Canvas Tote",
        price: 39.99,
        category: "totes",
        description: "Lightweight canvas tote bag",
        inStock: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        name: "Crossbody Bag",
        price: 49.99,
        category: "crossbody",
        description: "Stylish crossbody for commuting",
        inStock: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        name: "Shoulder Bag",
        price: 59.99,
        category: "shoulder",
        description: "Classic shoulder bag with adjustable strap",
        inStock: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        name: "Clutch",
        price: 29.99,
        category: "clutches",
        description: "Elegant clutch for evening",
        inStock: true,
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
      },
      {
        name: "Duffle Bag",
        price: 99.99,
        category: "duffle",
        description: "Large duffle for travel",
        inStock: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        name: "Sling Bag",
        price: 44.99,
        category: "sling",
        description: "Compact sling bag for quick trips",
        inStock: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        name: "Messenger Bag",
        price: 69.99,
        category: "messenger",
        description: "Vintage-inspired messenger bag",
        inStock: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        name: "Weekender Bag",
        price: 89.99,
        category: "weekender",
        description: "Perfect for short getaways",
        inStock: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        name: "Evening Clutch",
        price: 34.99,
        category: "clutches",
        description: "Beaded evening clutch",
        inStock: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    ];

    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${insertedProducts.length} products.`);

    // Step 4: Find and print the 5 most recent documents (sorted by createdAt)
    console.log(
      "\n🔍 Fetching 5 most recent products (sorted by createdAt descending)..."
    );
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 }) // -1 for descending order (newest first)
      .limit(5);

    console.log(`✅ Found ${recentProducts.length} recent products:`);
    recentProducts.forEach((product, index) => {
      printDocument(product, `Recent Product #${index + 1}`);
    });

    // Step 5: Find and print one document by _id
    console.log("\n🔍 Fetching one product by ID...");
    const firstProductId = insertedProducts[0]._id;
    console.log(`   Looking for product with _id: ${firstProductId}`);

    const productById = await Product.findById(firstProductId);
    if (productById) {
      printDocument(productById, "Product Found By ID");
      console.log("✅ Successfully retrieved product by ID.");
    } else {
      console.log("❌ Product not found.");
    }

    // Step 6: Query example with filter (bonus)
    console.log("\n🔍 Bonus: Fetching all products in stock with price > $50...");
    const filtered = await Product.find({
      inStock: true,
      price: { $gt: 50 },
    }).sort({ price: -1 });
    console.log(`✅ Found ${filtered.length} products matching criteria:`);
    filtered.forEach((product) => {
      console.log(`   - ${product.name}: $${product.price}`);
    });

  } catch (error) {
    console.error("\n❌ Error occurred:");
    console.error(error.message);
    process.exit(1);
  } finally {
    // Step 7: Close connection
    console.log("\n🔌 Closing MongoDB connection...");
    await mongoose.disconnect();
    console.log("✅ Disconnected successfully.\n");
  }
}

// ============================================================================
// RUN THE EXAMPLE
// ============================================================================

runExample();
