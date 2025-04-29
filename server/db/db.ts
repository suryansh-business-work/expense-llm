// src/db/db.ts
import mongoose from 'mongoose';

// ✅ Updated with specific DB name: "expense-llm"
const MONGO_URI = 'mongodb+srv://suryanshbusinesswork:education54@sibera-box.ofemtir.mongodb.net/expense-llm?retryWrites=true&w=majority&appName=sibera-box';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected to expense-llm');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
