export type WebSocketEventHandler<TPayload> = (payload: TPayload) => void;

export interface WebSocketServiceOptions {
  url: string;
}

export class WebSocketService<TServerMessage, TClientMessage = string> {
  private readonly url: string;
  private socket: WebSocket | null = null;
  private readonly listeners = new Set<WebSocketEventHandler<TServerMessage>>();

  constructor(options: WebSocketServiceOptions) {
    this.url = options.url;
  }

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (event) => {
      const payload = JSON.parse(String(event.data)) as TServerMessage;
      this.listeners.forEach((handler) => handler(payload));
    };
  }

  disconnect(code?: number, reason?: string): void {
    this.socket?.close(code, reason);
    this.socket = null;
  }

  send(message: TClientMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload =
      typeof message === "string" ? message : JSON.stringify(message as Record<string, unknown>);
    this.socket.send(payload);
  }

  subscribe(handler: WebSocketEventHandler<TServerMessage>): () => void {
    this.listeners.add(handler);

    return () => {
      this.listeners.delete(handler);
    };
  }
}
