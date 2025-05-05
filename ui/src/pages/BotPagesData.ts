// Define the interface for a single Bot Page
export interface BotPage {
  id: string;
  name: string;
  description: string;
  logo: string;
  type: string;
  url: string;
  botListPage: {
    heading: string;
  };
}

// Define the array of bot pages
const BotPagesData: BotPage[] = [
  {
    id: '1',
    name: 'Expense',
    description: 'Store all expense here',
    logo: '',
    type: 'finance',
    url: 'expense-track',
    botListPage: {
      heading: 'Expense Bot'
    }
  },
  {
    id: '2',
    name: 'Income Bot',
    description: 'Store all income here',
    logo: '',
    type: 'finance',
    url: 'income-track',
    botListPage: {
      heading: 'Income Bot'
    }
  },
  {
    id: '3',
    name: 'ToDos',
    description: 'Daily task track, Reminder etc',
    logo: '',
    type: 'tracking',
    url: 'todos',
    botListPage: {
      heading: 'ToDos Bot'
    }
  },
  {
    id: '4',
    name: 'Task',
    description: 'Long terms task track, Reminder etc',
    logo: '',
    type: 'tracking',
    url: 'task',
    botListPage: {
      heading: 'Task Bot'
    }
  },
  {
    id: '5',
    name: 'Wishlist',
    description: 'Manage your short terms and long terms wishlist',
    logo: '',
    type: 'tracking',
    url: 'wishlist',
    botListPage: {
      heading: 'Wishlist Bot'
    }
  },
  {
    id: '6',
    name: 'Reminders',
    description: 'Manage all your reminders here',
    logo: '',
    type: 'tracking',
    url: 'reminders',
    botListPage: {
      heading: 'Reminders Bot'
    }
  }
];

// Function to get a bot page by its URL
export function getBotPageByUrl(url: string): BotPage | undefined {
  return BotPagesData.find(page => page.url === url);
}

export default BotPagesData;
