import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  category: String,
  amount: Number,
  currency: String,
  from: String,
  time: Date,
  createdAt: { type: Date, default: Date.now },
});

export const ExpenseModel = mongoose.model("Expense", ExpenseSchema);
