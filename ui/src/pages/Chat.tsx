import { JSX, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { ChatBoxWrapper } from './ChatBoxWrapper';
import { API_URL } from '../utils/config';
import { formatDateTime } from '../utils/formatDate';

interface Message {
  type: 'user' | 'bot';
  botResponse: JSX.Element;
  timestamp: string;
}

export interface ExpenseMessage {
  _id: string;
  chatId: string;
  msgId: string;
  amount: number;
  expenseCategory: string;
  expenseFrom: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');
    ws.current.onmessage = async (event) => {
      setIsLoading(false);
      let text = '';
      if (typeof event.data === 'string') {
        text = event.data;
      } else if (event.data instanceof Blob) {
        text = await event.data.text();
      }
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          botResponse: <p>{text}</p>,
          timestamp: formatDateTime(new Date().toISOString()),
        },
      ]);
    };
    ws.current.onerror = () => setIsLoading(false);
    return () => {
      ws.current?.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!userInput.trim() || !ws.current || ws.current.readyState !== 1) return;
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        botResponse: <p>{userInput}</p>,
        timestamp: formatDateTime(new Date().toISOString()),
      },
    ]);
    setIsLoading(true);
    ws.current.send(userInput);
    setUserInput('');
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
