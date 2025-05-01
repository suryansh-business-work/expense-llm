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
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const getFormattedTime = () => {
    return dayjs().format('D MMM YYYY h:mm A');
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
    setLoading(true);

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

    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-bot-wrapper">
        <div className="chat-box">
          <div className="messages">
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
                />
              )
            )}
            {loading && (
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
