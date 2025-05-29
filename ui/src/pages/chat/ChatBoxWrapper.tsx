import { useEffect, useRef, useState, useCallback } from "react";
import BotGeneral from "./chat-message-blocks/BotGeneral";
import LoaderGeneral from "./chat-message-blocks/LoaderGeneral";
import UserGeneral from "./chat-message-blocks/UserGeneral";
import axios from "axios";
import API_LIST from "../apiList";
import { useParams } from "react-router-dom";
import { Alert, Snackbar, Skeleton, Avatar, Backdrop, CircularProgress } from "@mui/material";
import { useUserContext } from "../../providers/UserProvider";

const avatarUrl = 'https://mui.com/static/images/avatar/3.jpg';
interface ChatBoxWrapperProps {
  messages: any;
  isLoading: boolean;
}

const VISIBLE_COUNT = 10;

const MessageSkeleton = ({ align = "left" }: { align?: "left" | "right" }) => (
  <div
    style={{
      display: "flex",
      flexDirection: align === "right" ? "row-reverse" : "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 24,
    }}
  >
    <Skeleton variant="circular">
      <Avatar />
    </Skeleton>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "right" ? "flex-end" : "flex-start",
      }}
    >
      <Skeleton
        variant="text"
        width="30%"
        height={24}
        sx={{ alignSelf: align === "right" ? "flex-end" : "flex-start" }}
      />
      <Skeleton
        variant="text"
        width="80%"
        height={18}
        sx={{ alignSelf: align === "right" ? "flex-end" : "flex-start" }}
      />
      <Skeleton
        variant="text"
        width="60%"
        height={18}
        sx={{ alignSelf: align === "right" ? "flex-end" : "flex-start" }}
      />
    </div>
  </div>
);

export const ChatBoxWrapper: React.FC<ChatBoxWrapperProps> = ({ messages, isLoading }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [itemHeight, setItemHeight] = useState<number>(100);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [shouldStickToBottom, setShouldStickToBottom] = useState<boolean>(true);
  const { chatBotId } = useParams<{ chatBotId: string }>();
  const token = localStorage.getItem("token");
  const [appearanceLoading, setAppearanceLoading] = useState(true);
  const [chatAppearance, setChatAppearance] = useState<any>({});
  const { user } = useUserContext();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

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
    const fetchSettings = async () => {
      if (!chatBotId) return;
      setAppearanceLoading(true);
      try {
        const res = await axios.get(
          API_LIST.GET_CHAT_SETTING(chatBotId),
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const appearance = res?.data?.data?.setting?.appearance;
        setChatAppearance(appearance)
      } catch (err: any) {
        setSnackbar({ open: true, message: "Failed to load appearance settings", severity: "error" });
      } finally {
        setAppearanceLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line
  }, [chatBotId]);

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
  const paddingBottom = Math.max(0, (totalItems - endIndex) * itemHeight) + 20;

  return (
    <div
      className="chat-box"
      ref={containerRef}
      onScroll={handleScroll}
      style={{ overflowY: 'auto', height: '500px', background: chatAppearance?.chatBackground || '#fff', position: 'relative' }}
    >
      {/* Block full chat loader until appearanceLoading is false */}
      <Backdrop
        open={appearanceLoading}
        sx={{ color: "#1976d2", zIndex: 10, position: "absolute", backgroundColor: "rgba(255, 255, 255, 0.8)" }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="messages" style={{ paddingTop, paddingBottom, opacity: appearanceLoading ? 0.3 : 1, pointerEvents: appearanceLoading ? "none" : "auto" }}>
        {/* Skeleton loading when loading and no messages */}
        {isLoading || messages.length === 0 && appearanceLoading && (
          <>
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
          </>
        )}
        {messages.length > 0 && (
          <div style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }} ref={measureRef}>
            {messages[0].role === 'user' ? (
              <UserGeneral
                chatAppearance={chatAppearance}
                userContext={messages[0]?.userContext ? messages[0].userContext : user}
                timestamp={messages[0].timestamp}
                content={messages[0].botResponse}
              />
            ) : (
              <BotGeneral
                chatAppearance={chatAppearance}
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
              chatAppearance={chatAppearance}
              key={realIndex}
              userContext={message?.userContext ? message.userContext : user}
              timestamp={message.timestamp}
              content={message.botResponse}
            />
          ) : (
            <BotGeneral
              chatAppearance={chatAppearance}
              key={realIndex}
              avatarUrl={avatarUrl}
              timestamp={message.timestamp}
              content={message.botResponse}
              isLoading={false}
            />
          );
        })}
        {/* Show loader for streaming/loading after messages */}
        {isLoading && messages.length > 0 && <LoaderGeneral timestamp={''} />}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};
