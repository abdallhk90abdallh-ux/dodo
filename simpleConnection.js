const mongoose = require("mongoose");

const uri = "mongodb+srv://abdallhk90abdallh_db_user:413277@cluster0.eaddiwq.mongodb.net/test?retryWrites=true&w=majority";

async function run() {
  try {
    await mongoose.connect(uri);

    console.log("✅ Connected to MongoDB");

    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Ping success");
    
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
