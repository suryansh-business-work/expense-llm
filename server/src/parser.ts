import nlp from 'compromise';
import categories from '../models/categoryModel';
import cards from '../models/cardModel';

interface ParsedResult {
  expenseCategory: string;
  amount: number | null;  // Allow null if the amount is not found
  expenseFrom: string;
}

export function parseExpense(userMsg: string): ParsedResult {
  const loweruserMsg = userMsg.toLowerCase();
  const doc = nlp(loweruserMsg);

  // Find the amount
  const amountMatch = loweruserMsg.match(/\d+/);
  const amount = amountMatch ? parseInt(amountMatch[0]) : null;

  // Find the category
  const expenseCategory = categories.find((cat: string) => loweruserMsg.includes(cat)) || 'others';

  // Find the expense source
  const expenseFrom = cards.find((card: string) => {
    const cardKeywords = card.split(' ');
    return cardKeywords.some((keyword: string) => loweruserMsg.includes(keyword));
  }) || 'unknown';

  return {
    expenseCategory,
    amount,  // This can be null if no amount is found
    expenseFrom
  };
}
