import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Message {
  type: 'user' | 'bot';
  text: string;
}

const Chat = () => {
  const { chatId } = useParams(); // ✅ get chatId from route
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to UI
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', text: userInput },
    ]);

    try {
      // ✅ Send sentence and chatId to backend
      const response = await axios.post('http://localhost:3000/parse-expense', {
        sentence: userInput,
        chatId: chatId, // included in request body
      });

      const botResponse = response.data.expense_category
        ? `Category: ${response.data.expense_category}, Amount: ${response.data.amount}, Expense From: ${response.data.expense_from}`
        : 'Sorry, I could not parse that correctly.';

      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: botResponse },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Something went wrong. Please try again later.';
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: errorMessage },
      ]);
    }

    setUserInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-bot-wrapper">
        <div className="chat-box">
          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <p>{message.text}</p>
              </div>
            ))}
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
