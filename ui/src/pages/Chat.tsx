import { JSX, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

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
    return dayjs().format('D MMM YYYY h:mm A'); // e.g., "2 Oct 2025 12:15 PM"
  };

  useEffect(() => {
    // Scroll to the bottom when messages or loading state change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const timestamp = getFormattedTime();

    const userMessage: Message = {
      type: 'user',
      timestamp,
      botResponse: (
        <div className="message-content">
          <p>{userInput}</p>
        </div>
      ),
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
          <div className="message-content">
            <p><strong>Category:</strong> {response.data.expense_category}</p>
            <p><strong>Amount:</strong> {response.data.amount}</p>
            <p><strong>Expense From:</strong> {response.data.expense_from}</p>
          </div>
        ) : (
          <div className="message-content">
            <p>Sorry, I could not parse that correctly.</p>
          </div>
        ),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Something went wrong. Please try again later.';

      const errorBotMessage: Message = {
        type: 'bot',
        timestamp: getFormattedTime(),
        botResponse: (
          <div className="message-content">
            <p>{errorMessage}</p>
          </div>
        ),
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
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className='avatar-image'>
                  <img src={avatarUrl} alt="avatar" className="avatar" />
                </div>
                <div className="message-bubble">
                  {message.botResponse}
                  <div className="timestamp">{message.timestamp}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row bot-message">
                <div className='avatar-image'>
                  <img src={avatarUrl} alt="avatar" className="avatar" />
                </div>
                <div className="message-bubble">
                  <div className="loader">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                  <div className="timestamp">{getFormattedTime()}</div>
                </div>
              </div>
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
