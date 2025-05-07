import mongoose from 'mongoose';

const expenseUserMsgSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
  },
  msgId: {
    type: String,
    required: true,
  },
  userMsg: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

const ExpenseUserMsgModel = mongoose.model('ExpenseUserMsgSchema', expenseUserMsgSchema);

export default ExpenseUserMsgModel;
