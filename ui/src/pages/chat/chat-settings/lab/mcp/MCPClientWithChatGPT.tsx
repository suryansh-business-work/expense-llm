import { useState } from 'react';
import { Box } from '@mui/material';
import RegisteredTools from "./RegisteredTools";
import EventSource from './EventSource';
import ChatTest from "./chat-test/ChatTest";

const MCPClientWithChatGPT = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [mcpClient, setMcpClient] = useState<any>(null);

  return (
    <div className="container py-4">
      <div className="row">
        <div className='col-12'>
          <EventSource
            onConnected={(tools, mcpClient) => {
              setTools(tools);
              setMcpClient(mcpClient);
            }}
          />
        </div>
        <div className="col-12 col-md-8 mb-3">
          <Box>
            <ChatTest tools={tools} mcpClient={mcpClient} />
          </Box>
        </div>
        <div className="col-12 col-md-4">
          <RegisteredTools tools={tools} />
        </div>
      </div>
    </div>
  );
};

export default MCPClientWithChatGPT;
