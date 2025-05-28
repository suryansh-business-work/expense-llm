import { JSX, useEffect, useRef, useState } from 'react';
import { ChatBoxWrapper } from './ChatBoxWrapper';
import { formatDateTime } from '../../utils/formatDate';
import { useUserContext } from '../../providers/UserProvider';
import { useParams } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';
import ChatInput from './ChatInput';
import ChatTopPannel from './ChatTopPannel';

interface Message {
  role: 'user' | 'bot' | 'system';
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
  const { chatBotId } = useParams<{ childBotType: string; chatBotId: string }>();

  useEffect(() => {
    let wsInstance: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectWebSocket = () => {
      wsInstance = new WebSocket('ws://localhost:8081');

      wsInstance.onopen = () => {
        setWsConnected(true);
        setToast({ open: true, message: 'Chat Connected', severity: 'success' });
        // Request chat history on connect
        wsInstance.send(
          JSON.stringify({
            firstLoadConnect: true,
            userContext: user,
            chatBotId,
            userInput: null,
          })
        );
      };

      wsInstance.onclose = () => {
        setWsConnected(false);
        setToast({ open: true, message: 'Chat Disconnected', severity: 'error' });
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      };

      wsInstance.onerror = () => {
        setIsLoading(false);
        setWsConnected(false);
        setToast({ open: true, message: 'Chat error', severity: 'error' });
      };

      wsInstance.onmessage = async (event) => {
        setIsLoading(false);
        let text = '';
        if (typeof event.data === 'string') {
          text = event.data;
        } else if (event.data instanceof Blob) {
          text = await event.data.text();
        }
        try {
          const parsed = JSON.parse(text);
          console.log(parsed)
          const botMessages = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed.messages)
              ? parsed.messages
              : [parsed];

          setMessages((prev) => [
            ...prev,
            ...botMessages.map((data: any) => ({
              role: data?.role || 'bot',
              botResponse: <p>{typeof data?.content === 'string' ? data.content : JSON.stringify(data?.content)}</p>,
              timestamp: formatDateTime(data?.createdAt || new Date().toISOString()),
              userContext: data?.userContext
            })),
          ]);
        } catch (error) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'bot',
              botResponse: <p>{text}</p>,
              timestamp: formatDateTime(new Date().toISOString()),
              userContext: user
            },
          ]);
        }
      };

      ws.current = wsInstance;
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      wsInstance?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatBotId, user]);

  const handleSendMessage = () => {
    if (!userInput.trim() || !ws.current || ws.current.readyState !== 1) {
      setToast({ open: true, message: 'Connection disconnected. Please wait...', severity: 'warning' });
      return;
    }
    const timestamp = formatDateTime(new Date().toISOString());
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        botResponse: <p>{userInput}</p>,
        timestamp,
      },
    ]);
    ws.current.send(
      JSON.stringify({
        firstLoadConnect: false,
        userContext: user,
        chatBotId,
        userInput,
        role: 'user',
      })
    );
    setUserInput('');
    setIsLoading(true);
  };

  return (
    <div className="chat-container">
      <div className="chat-bot-wrapper">
        <ChatTopPannel />
        <ChatBoxWrapper messages={messages} isLoading={isLoading} />
        <div className='container'>
          <div className='row'>
            <div className='col-12'>
              <ChatInput
                userInput={userInput}
                setUserInput={setUserInput}
                handleSendMessage={handleSendMessage}
                wsConnected={wsConnected}
              />
            </div>
          </div>
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
