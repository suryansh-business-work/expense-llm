import mongoose from 'mongoose';

const expenseBotReplyMsgSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
  },
  msgId: {
    type: String,
    required: true,
  },
  expenseCategory: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  expenseFrom: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

const ExpenseBotReplyMsgModel = mongoose.model('ExpenseBotReplyMsgSchema', expenseBotReplyMsgSchema);

export default ExpenseBotReplyMsgModel;
