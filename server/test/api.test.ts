import axios from 'axios';

const API_URL = 'http://localhost:3000/parse-expense';

const testSentences: string[] = [
  "I had spent 20 INR on groceries from my Kotak credit card",
  "Bought groceries for 150 INR using HDFC credit card",
  // "I spent 500 on fuel via my ICICI credit card",
  // "Had dinner for 200 INR on my Axis Bank card",
  // "Paid 250 for a meal at a restaurant with my SBI card",
  // "I spent 60 INR for a coffee using my Citi Bank credit card",
  // "Purchased 100 INR worth of clothes from a mall with my Kotak card",
  // "I used my HDFC card to pay 500 INR for groceries",
  // "Bought 300 INR worth of electronics from my SBI card",
  // "Spent 120 INR on an Uber ride using my Axis Bank card",
  // "Paid 75 INR for a cab ride with my Citi Bank credit card",
  // "I paid 1000 INR on a new mobile using my ICICI credit card",
  // "Spent 30 INR at the bookstore using my Kotak credit card",
  // "Paid 200 INR for groceries using my HDFC card",
  // "Used my SBI card for a 450 INR payment on clothes",
  // "I spent 50 INR on a coffee from Starbucks using my Axis Bank credit card",
  // "Bought a 400 INR gift card using my Citi Bank card",
  // "Paid 600 INR for a hotel stay with my ICICI credit card",
  // "I used my Axis Bank card to pay 250 INR for a movie ticket",
  // "Spent 300 INR on a lunch with my Kotak credit card"
];

describe('API Tests for Expense Parsing', () => {
  test.each(testSentences)('should parse sentence: "%s" correctly', async (sentence) => {
    const chatId = 'test-chat-123'; // You can use uuidv4() for uniqueness if needed

    const response = await axios.post(API_URL, {
      sentence,
      chatId,
    });

    expect(response.data).toHaveProperty('expense_category');
    expect(response.data).toHaveProperty('amount');
    expect(typeof response.data.amount).toBe('number');
    expect(response.data).toHaveProperty('expense_from');
    expect(response.data).toHaveProperty('available_categories');
    expect(response.data).toHaveProperty('available_cards');

    expect([
      'groceries',
      'fuel',
      'meal',
      'clothes',
      'electronics',
      'coffee',
      'others'
    ]).toContain(response.data.expense_category);
  });
});
