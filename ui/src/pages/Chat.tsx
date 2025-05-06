import { JSX, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import UserGeneral from './chat-message-blocks/UserGeneral';
import BotGeneral from './chat-message-blocks/BotGeneral';
import LoaderGeneral from './chat-message-blocks/LoaderGeneral';

interface Message {
  type: 'user' | 'bot';
  botResponse: JSX.Element;
  timestamp: string;
}

const avatarUrl = 'https://ik.imagekit.io/esdata1/exyconn/logo/exyconn.svg';

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const getFormattedTime = () => {
    return dayjs().format('D MMM YYYY h:mm A');
  };

  // Fetch older messages (on scroll-up or initial load)
  const fetchMessages = async (initial = false) => {
    if (!chatId || (!initial && !cursor) || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/list-expenses', {
        params: {
          chatId,
          direction: 'older',
          cursor,
          limit: 10,
        },
      });

      const newExpenses = response.data.expenses;

      if (newExpenses.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const mappedMessages: Message[] = newExpenses.map((exp: any) => ({
        type: 'bot',
        timestamp: dayjs(exp._id).format('D MMM YYYY h:mm A'),
        botResponse: (
          <>
            <p><strong>Category:</strong> {exp.expense_category}</p>
            <p><strong>Amount:</strong> {exp.amount}</p>
            <p><strong>Expense From:</strong> {exp.expense_from}</p>
          </>
        ),
      }));

      setMessages((prev) => [...mappedMessages.reverse(), ...prev]);
      setCursor(newExpenses[newExpenses.length - 1]._id); // last (oldest) becomes next cursor
    } catch (err) {
      console.error('Failed to load messages', err);
    }
    setIsLoading(false);
  };

  // Load on first mount
  useEffect(() => {
    fetchMessages(true);
  }, [chatId]);

  // Scroll to bottom when user sends message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Detect scroll to top (for older messages)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMessages();
        }
      },
      { threshold: 1 }
    );

    if (topRef.current) observer.observe(topRef.current);

    return () => {
      if (topRef.current) observer.unobserve(topRef.current);
    };
  }, [topRef.current, hasMore, isLoading]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const timestamp = getFormattedTime();

    const userMessage: Message = {
      type: 'user',
      timestamp,
      botResponse: <p>{userInput}</p>,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setUserInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/parse-expense', {
        sentence: userInput,
        chatId,
      });

      const botMessage: Message = {
        type: 'bot',
        timestamp: getFormattedTime(),
        botResponse: response.data.expense_category ? (
          <>
            <p><strong>Category:</strong> {response.data.expense_category}</p>
            <p><strong>Amount:</strong> {response.data.amount}</p>
            <p><strong>Expense From:</strong> {response.data.expense_from}</p>
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
        timestamp: getFormattedTime(),
        botResponse: <p>{errorMessage}</p>,
      };

      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-bot-wrapper">
        <div className="chat-box">
          <div className="messages">
            <div ref={topRef} /> {/* Trigger scroll-up load */}
            {messages.map((message, index) =>
              message.type === 'user' ? (
                <UserGeneral
                  key={index}
                  avatarUrl={avatarUrl}
                  timestamp={message.timestamp}
                  content={message.botResponse}
                />
              ) : (
                <BotGeneral
                  key={index}
                  avatarUrl={avatarUrl}
                  timestamp={message.timestamp}
                  content={message.botResponse}
                  isLoading={false}
                />
              )
            )}
            {isLoading && (
              <LoaderGeneral avatarUrl={avatarUrl} timestamp={getFormattedTime()} />
            )}
            <div ref={bottomRef} />
          </div>
        </div>
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
