import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
  },
  expense_category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  expense_from: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
