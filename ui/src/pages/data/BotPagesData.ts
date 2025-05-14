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
  bots: Bot[];
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
    },
    bots: [
      { id: 'a1b2c3d4-e5f6-7890-ab12-cd34ef56gh78', name: 'Home expense', url: 'home-expense' },
      { id: '9f8e7d6c-5b4a-3210-abcd-12345678efgh', name: 'Business expense', url: 'business-expense' }
    ]
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
    },
    bots: [
      { id: '11223344-5566-7788-99aa-bbccddeeff00', name: 'Salary', url: 'salary-income' },
      { id: '00ffeedd-ccbb-aabb-8899-776655443322', name: 'Freelance', url: 'freelance-income' }
    ]
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
    url: 'todo-bot',
    botListPage: {
      heading: 'ToDos Bot'
    },
    bots: [
      { id: 'abc123ef-4567-89ab-cdef-0123456789ab', name: 'Morning Routine', url: 'morning-todos' },
      { id: 'def456gh-1234-5678-90ab-cdef12345678', name: 'Work Tasks', url: 'work-todos' }
    ]
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
    url: 'task',
    botListPage: {
      heading: 'Task Bot'
    },
    bots: [
      { id: '0a1b2c3d-4e5f-6789-0abc-def123456789', name: 'Project A', url: 'project-a' },
      { id: '12345678-90ab-cdef-1234-567890abcdef', name: 'Project B', url: 'project-b' }
    ]
  },
  {
    id: '5',
    name: 'Wishlist',
    description: 'Create and track your short-term and long-term wishes with the Wishlist Bot.',
    logo: '',
    type: {
      name: 'Daily life',
      value: 'daily-life',
      description: 'Bots for daily routines, reminders, and personal management.',
      icon: ''
    },
    url: 'wishlist-bot',
    botListPage: {
      heading: 'Wishlist Bot'
    },
    bots: [
      { id: 'abcdef12-3456-7890-abcd-ef1234567890', name: 'Short-term Wishes', url: 'short-wishlist' },
      { id: 'fedcba98-7654-3210-ba98-76543210fedc', name: 'Long-term Wishes', url: 'long-wishlist' }
    ]
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
    },
    bots: [
      { id: 'deadbeef-1234-5678-9abc-def012345678', name: 'Doctor Appointment', url: 'doctor-reminder' },
      { id: 'beefdead-4321-8765-ba98-76543210abcd', name: 'Meeting Reminder', url: 'meeting-reminder' }
    ]
  }
];

// Function to get a bot page by its URL
export function getBotPageByUrl(url: string): BotPage | undefined {
  return BotPagesData.find(page => page.url === url);
}

export default BotPagesData;
