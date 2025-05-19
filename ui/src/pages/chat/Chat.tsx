import { JSX, useEffect, useRef, useState } from 'react';
import { ChatBoxWrapper } from './ChatBoxWrapper';
import { formatDateTime } from '../../utils/formatDate';
import { useUserContext } from '../../providers/UserProvider';
import { useParams } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';

interface Message {
  type: 'user' | 'bot';
  botResponse: JSX.Element;
  timestamp: string;
}

const Alert = MuiAlert as React.FC<{ severity: AlertColor; children: React.ReactNode }>;

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const ws = useRef<WebSocket | null>(null);
  const { user } = useUserContext();
  const { childBotType, chatBotId } = useParams<{ childBotType: string; chatBotId: string }>();

  useEffect(() => {
    let wsInstance: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectWebSocket = () => {
      wsInstance = new WebSocket('ws://localhost:8080');

      wsInstance.onopen = () => {
        setWsConnected(true);
        setToast({ open: true, message: 'WebSocket connected', severity: 'success' });
      };

      wsInstance.onclose = () => {
        setWsConnected(false);
        setToast({ open: true, message: 'WebSocket disconnected', severity: 'error' });
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      };

      wsInstance.onerror = () => {
        setIsLoading(false);
        setWsConnected(false);
        setToast({ open: true, message: 'WebSocket error', severity: 'error' });
      };

      wsInstance.onmessage = async (event) => {
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

      ws.current = wsInstance;
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      wsInstance?.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!userInput.trim() || !ws.current || ws.current.readyState !== 1) {
      setToast({ open: true, message: 'Connection disconnected. Please wait...', severity: 'warning' });
      return;
    }
    const timestamp = formatDateTime(new Date().toISOString());
    setIsLoading(true);
    const userMessage = {
      childBotType: childBotType,
      chatBotId: chatBotId,
      userInput: userInput,
      userId: user?.userId, 
      timestamp: new Date().toISOString(),
    };
    ws.current.send(JSON.stringify(userMessage));
    setMessages((prev) => [
      ...prev,
      {
        type: 'user',
        botResponse: <p>{userInput}</p>,
        timestamp: timestamp,
      },
    ]);
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
            disabled={!wsConnected}
          />
          <button onClick={handleSendMessage} disabled={!wsConnected}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Chat;
