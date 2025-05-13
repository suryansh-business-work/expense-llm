import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ChatBoxWrapper } from './ChatBoxWrapper';
import { API_URL } from '../utils/config';

interface Message {
  type: 'user' | 'bot';
  botResponse: JSX.Element;
  timestamp: string;
}

function sortByTimestamp(data: any, userTimezone = 'UTC') {
  // Sort the data based on timestamp
  const sorted = data.sort((a: any, b: any) => {
      const timeA: any = dayjs.utc(a.timestamp, 'DD MMM YYYY hh:mm:ss A').tz(userTimezone);
      const timeB: any = dayjs.utc(b.timestamp, 'DD MMM YYYY hh:mm:ss A').tz(userTimezone);
      return timeA - timeB;
  });

  // Separate user and bot messages
  const users = sorted.filter((item: any) => item.type === 'user');
  const bots = sorted.filter((item: any) => item.type === 'bot');

  // Interleave user → bot
  const result = [];
  const maxLength = Math.max(users.length, bots.length);
  for (let i = 0; i < maxLength; i++) {
      if (users[i]) result.push(users[i]);
      if (bots[i]) result.push(bots[i]);
  }

  return result;
}

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const userTimezone = 'Asia/Kolkata';

  function formatDateTime(isoString: string): string {
    console.log(isoString)
    return dayjs.utc(isoString).tz(userTimezone).format('DD MMM YYYY hh:mm:ss A');
  }

  const fetchMessages = async () => {
    if (!chatId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/list/expenses`, {
        params: {
          chatId,
          limit: 10,
        },
      });
      setIsLoading(false);
      const newExpenses = response.data.expenseBotReplyMsgRes;
      const mappedMessages: Message[] = newExpenses.map((exp: any) => ({
        type: 'bot',
        timestamp: formatDateTime(exp?.createdAt),
        botResponse: (
          <>
            <p><strong>Category:</strong> {exp.expenseCategory}</p>
            <p><strong>Amount:</strong> {exp.amount}</p>
            <p><strong>Expense From:</strong> {exp.expenseFrom}</p>
          </>
        ),
      }));

      const newUserMsg = response.data.expenseUserMsgRes;
      const mappedUserMessages: Message[] = newUserMsg.map((exp: any) => ({
        type: 'user',
        timestamp: formatDateTime(exp?.createdAt),
        botResponse: (
          <>
            <p>{exp?.userMsg}</p>
          </>
        ),
      }));
      console.log([...mappedMessages, ...mappedUserMessages])
      setMessages(sortByTimestamp([...mappedMessages, ...mappedUserMessages]));
    } catch (err) {
      console.error('Failed to load messages', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userMessage: Message = {
      type: 'user',
      timestamp: formatDateTime(new Date().toISOString()),
      botResponse: <p>{userInput}</p>,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/create/expense', {
        chatId: chatId,
        userMsg: userInput
      });
      const botMessage: Message = {
        type: 'bot',
        timestamp: formatDateTime(response?.data?.user?.createdAt),
        botResponse: response.data.bot ? (
          <>
            <p><strong>Category:</strong> {response?.data?.bot?.expenseCategory}</p>
            <p><strong>Amount:</strong> {response?.data?.bot?.amount}</p>
            <p><strong>Expense From:</strong> {response?.data?.bot?.expenseFrom}</p>
          </>
        ) : (
          <p>Sorry, I could not parse that correctly.</p>
        ),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Something went wrong. Please try again later.';

      const errorBotMessage: Message = {
        type: 'bot',
        timestamp: formatDateTime(new Date().toISOString()),
        botResponse: <p>{errorMessage}</p>,
      };

      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-bot-wrapper">
        <ChatBoxWrapper messages={messages} isLoading={isLoading} />
        <div className="chat-input-container">
          <input
            type="text"
            placeholder="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button onClick={handleSendMessage}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
