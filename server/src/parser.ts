import nlp from 'compromise';
import categories from '../models/categoryModel';
import cards from '../models/cardModel';

interface ParsedResult {
  expense_category: string;
  amount: number | null;  // Allow null if the amount is not found
  expense_from: string;
}

export function parseExpense(sentence: string): ParsedResult {
  const lowerSentence = sentence.toLowerCase();
  const doc = nlp(lowerSentence);

  // Find the amount
  const amountMatch = lowerSentence.match(/\d+/);
  const amount = amountMatch ? parseInt(amountMatch[0]) : null;

  // Find the category
  const expense_category = categories.find((cat: string) => lowerSentence.includes(cat)) || 'others';

  // Find the expense source
  const expense_from = cards.find((card: string) => {
    const cardKeywords = card.split(' ');
    return cardKeywords.some((keyword: string) => lowerSentence.includes(keyword));
  }) || 'unknown';

  return {
    expense_category,
    amount,  // This can be null if no amount is found
    expense_from
  };
}
