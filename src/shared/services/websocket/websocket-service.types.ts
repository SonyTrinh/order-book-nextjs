export type WebSocketEventHandler<TPayload> = (payload: TPayload) => void;
export type WebSocketOpenHandler = () => void;
export type WebSocketCloseHandler = (event: CloseEvent) => void;
export type WebSocketErrorHandler = (event: Event) => void;

export interface WebSocketServiceOptions {
  url: string;
  debugName?: string;
}
