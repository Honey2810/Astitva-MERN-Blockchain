import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using MONGODB_URI environment variable
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure code (1) to indicate critical error
  }
};

export default connectDB;
