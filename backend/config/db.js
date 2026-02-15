const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // These options are mostly defaults now, but good to be explicit in 2025
      // useNewUrlParser: true,     // no longer needed (removed in newer mongoose)
      // useUnifiedTopology: true,  // no longer needed
      // useCreateIndex: true,      // removed
      // useFindAndModify: false,   // removed

      serverSelectionTimeoutMS: 5000,   // faster timeout for Atlas
      maxPoolSize: 10,                  // reasonable connection pool
    });

    console.log('MongoDB connected successfully ✅');
  } catch (err) {
    console.error('MongoDB connection error ❌:', err.message);
    // In production: you might want to retry or exit gracefully
    process.exit(1); // ← stops the app on fatal DB failure (common pattern)
  }
};

module.exports = connectDB;