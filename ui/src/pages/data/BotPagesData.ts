// Define the interface for a single Bot
export interface Bot {
  id: string;
  name: string;
  url: string;
}

// Define the interface for a single Bot Page
export interface BotPage {
  id: string;
  name: string;
  description: string;
  logo: string;
  type: any;
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
    description: 'Track, manage, and analyze all your expenses in one place with the Expense Bot.',
    logo: '',
    type: {
      name: 'Finance',
      value: 'finance',
      description: 'Bots for managing financial transactions and records.',
      icon: ''
    },
    url: 'expense-bot',
    botListPage: {
      heading: 'Expense Bot'
    }
  },
  {
    id: '2',
    name: 'Income Bot',
    description: 'Monitor and record all your income sources efficiently with the Income Bot.',
    logo: '',
    type: {
      name: 'Finance',
      value: 'finance',
      description: 'Bots for managing financial transactions and records.',
      icon: ''
    },
    url: 'income-bot',
    botListPage: {
      heading: 'Income Bot'
    }
  },
  {
    id: '3',
    name: 'ToDos',
    description: 'Organize your daily tasks, reminders, and routines with the ToDos Bot.',
    logo: '',
    type: {
      name: 'Daily life',
      value: 'daily-life',
      description: 'Bots for daily routines, reminders, and personal management.',
      icon: ''
    },
    url: 'todos-bot',
    botListPage: {
      heading: 'ToDos Bot'
    }
  },
  {
    id: '4',
    name: 'Task',
    description: 'Manage your long-term projects and professional tasks with the Task Bot.',
    logo: '',
    type: {
      name: 'Professional',
      value: 'professional',
      description: 'Bots for professional and project management.',
      icon: ''
    },
    url: 'task-bot',
    botListPage: {
      heading: 'Task Bot'
    }
  },
  {
    id: '6',
    name: 'Reminders',
    description: 'Never miss an important event or meeting with the Reminders Bot.',
    logo: '',
    type: {
      name: 'Professional',
      value: 'professional',
      description: 'Bots for professional and project management.',
      icon: ''
    },
    url: 'reminder-bot',
    botListPage: {
      heading: 'Reminders Bot'
    }
  },
  {
    id: '7',
    name: 'Website Scraper',
    description: 'Extract data from websites efficiently using the Website Scraper Bot.',
    logo: '',
    type: {
      name: 'Professional',
      value: 'professional',
      description: 'Bots for professional and project management.',
      icon: ''
    },
    url: 'website-scraper',
    botListPage: {
      heading: 'Website Scraper Bot'
    }
  }
];

// Function to get a bot page by its URL
export function getBotPageByUrl(url: string): BotPage | undefined {
  return BotPagesData.find(page => page.url === url);
}

export default BotPagesData;
