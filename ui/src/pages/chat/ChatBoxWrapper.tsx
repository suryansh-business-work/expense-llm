import { useEffect, useRef, useState, useCallback } from "react";
import BotGeneral from "./chat-message-blocks/BotGeneral";
import LoaderGeneral from "./chat-message-blocks/LoaderGeneral";
import UserGeneral from "./chat-message-blocks/UserGeneral";

const avatarUrl = 'https://ik.imagekit.io/esdata1/exyconn/logo/exyconn.svg';
interface ChatBoxWrapperProps {
  messages: any;
  isLoading: boolean;
}

const VISIBLE_COUNT = 10;

export const ChatBoxWrapper: React.FC<ChatBoxWrapperProps> = ({ messages, isLoading }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [itemHeight, setItemHeight] = useState<number>(100);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [shouldStickToBottom, setShouldStickToBottom] = useState<boolean>(true);

  useEffect(() => {
    if (measureRef.current) {
      const height = measureRef.current.getBoundingClientRect().height;
      if (height > 0) setItemHeight(height);
    }
  }, [messages.length > 0]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setScrollTop(scrollTop);
    setShouldStickToBottom(scrollTop + clientHeight >= scrollHeight - 20);
  }, []);

  useEffect(() => {
    if (shouldStickToBottom && containerRef.current) {
      requestAnimationFrame(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [messages, isLoading]);

  const totalItems = messages.length;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(totalItems, startIndex + VISIBLE_COUNT);
  const visibleMessages = messages.slice(startIndex, endIndex);
  const paddingTop = startIndex * itemHeight;
  const paddingBottom = Math.max(0, (totalItems - endIndex) * itemHeight);

  return (
    <div
      className="chat-box"
      ref={containerRef}
      onScroll={handleScroll}
      style={{ overflowY: 'auto', height: '500px' }} 
    >
      <div className="messages" style={{ paddingTop, paddingBottom }}>
        {messages.length > 0 && (
          <div style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }} ref={measureRef}>
            {messages[0].role === 'user' ? (
              <UserGeneral
                avatarUrl={avatarUrl}
                timestamp={messages[0].timestamp}
                content={messages[0].botResponse}
              />
            ) : (
              <BotGeneral
                avatarUrl={avatarUrl}
                timestamp={messages[0].timestamp}
                content={messages[0].botResponse}
                isLoading={false}
              />
            )}
          </div>
        )}
        {visibleMessages.map((message: any, index: number) => {
          const realIndex = startIndex + index;
          return message.role === 'user' ? (
            <UserGeneral
              key={realIndex}
              avatarUrl={avatarUrl}
              timestamp={message.timestamp}
              content={message.botResponse}
            />
          ) : (
            <BotGeneral
              key={realIndex}
              avatarUrl={avatarUrl}
              timestamp={message.timestamp}
              content={message.botResponse}
              isLoading={false}
            />
          );
        })}
        {isLoading && <LoaderGeneral avatarUrl={avatarUrl} timestamp={''} />}
      </div>
    </div>
  );
};
