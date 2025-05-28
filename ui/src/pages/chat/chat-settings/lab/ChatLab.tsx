import PromptSection from "./prompt-management/PromptSection";
import McpServers from "./MCPServers";
import { Card, Divider } from "@mui/material";

const ChatLab = () => {
  return (
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
  );
};

export default ChatLab;
