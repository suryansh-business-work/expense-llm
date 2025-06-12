import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3500';

class TerminalSocketService {
  private socket: any | null = null;
  private eventHandlers: Record<string, Array<(data: any) => void>> = {};
  
  constructor() {
    this.connect();
  }
  
  private connect() {
    try {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });
      
      this.socket.on('connect_error', (error: any) => {
        console.error('Socket connection failed:', error);
      });
      
      // Register default event handlers
      this.setupDefaultListeners();
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }
  
  private setupDefaultListeners() {
    if (!this.socket) return;
    
    this.socket.on('output', (data: any) => this.triggerEvent('output', data));
    this.socket.on('error', (data: any) => this.triggerEvent('error', data));
    this.socket.on('finished', (data: any) => this.triggerEvent('finished', data));
    this.socket.on('container-selected', (data: any) => this.triggerEvent('container-selected', data));
    this.socket.on('shell-started', (data: any) => this.triggerEvent('shell-started', data));
    this.socket.on('shell-closed', (data: any) => this.triggerEvent('shell-closed', data));
  }
  
  private triggerEvent(eventName: string, data: any) {
    if (this.eventHandlers[eventName]) {
      this.eventHandlers[eventName].forEach(handler => handler(data));
    }
  }
  
  public on(eventName: string, handler: (data: any) => void): () => void {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);
    
    // Return unsubscribe function
    return () => {
      if (this.eventHandlers[eventName]) {
        this.eventHandlers[eventName] = this.eventHandlers[eventName].filter(h => h !== handler);
      }
    };
  }
  
  public selectContainer(containerId: string) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('select-container', containerId);
  }
  
  public executeCommand(command: string) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('execute', command);
  }
  
  public startShell() {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('start-shell');
  }
  
  public sendInput(input: string) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('input', input);
  }
  
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const terminalSocket = new TerminalSocketService();