import ChatTopPannel from "../../ChatTopPannel";
import McpServers from "./McpServers";
import PromptSection from "./prompt-management/PromptSection";
import { Card, Divider } from "@mui/material";

const ChatLab = () => {
  return (
    <section className="chat-lab">
      <ChatTopPannel />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-12 col-lg-12">
            <Card className="p-4 shadow-sm">
              <McpServers />
              <Divider className="my-4" />
              <PromptSection />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatLab;
