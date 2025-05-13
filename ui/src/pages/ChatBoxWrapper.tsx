import { useEffect, useRef } from "react";
import BotGeneral from "./chat-message-blocks/BotGeneral"
import LoaderGeneral from "./chat-message-blocks/LoaderGeneral"
import UserGeneral from "./chat-message-blocks/UserGeneral"
import { JSX } from "@emotion/react/jsx-runtime";
const avatarUrl = 'https://ik.imagekit.io/esdata1/exyconn/logo/exyconn.svg';

interface Message {
  type: 'user' | 'bot';
  botResponse: JSX.Element;
  timestamp: string;
}

interface ChatBoxWrapperProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatBoxWrapper: React.FC<ChatBoxWrapperProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return <div className="chat-box">
      <div className="messages">
        {messages.map((message: any, index: number) =>
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
          <LoaderGeneral avatarUrl={avatarUrl} timestamp={''} />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
}
