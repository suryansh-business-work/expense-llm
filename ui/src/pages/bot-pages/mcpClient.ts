import { v4 as uuidv4 } from "uuid";

export class MCPClient {
  sessionId: string;
  eventSource: EventSource | null = null;

  constructor(public onMessage: (data: any) => void) {
    this.sessionId = '786c5c45-4eed-4c3a-ab22-643d2cd98202';
  }

  connect() {
    this.eventSource = new EventSource(`http://localhost:3001/sse?sessionId=${this.sessionId}`);
    this.eventSource.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    });
  }

  async sendToolCall(toolName: string, args: any) {
    const payload = {
      type: "toolCall",
      tool: toolName,
      args
    };

    await fetch(`http://localhost:3001/messages?sessionId=${this.sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  close() {
    this.eventSource?.close();
  }
}
