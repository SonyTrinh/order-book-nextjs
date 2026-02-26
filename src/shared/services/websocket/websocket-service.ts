import type {
  WebSocketCloseHandler,
  WebSocketErrorHandler,
  WebSocketEventHandler,
  WebSocketOpenHandler,
  WebSocketServiceOptions,
} from "./websocket-service.types";

export const createWebSocketService = <TServerMessage, TClientMessage = string>(
  options: WebSocketServiceOptions,
) => {
  let socket: WebSocket | null = null;
  let isExplicitDisconnect = false;
  let pendingMessages: string[] = [];
  const logPrefix = options.debugName ? `[ws:${options.debugName}]` : "[ws]";

  const listeners = new Set<WebSocketEventHandler<TServerMessage>>();
  const openListeners = new Set<WebSocketOpenHandler>();
  const closeListeners = new Set<WebSocketCloseHandler>();
  const errorListeners = new Set<WebSocketErrorHandler>();

  const connect = () => {
    if (socket && socket.readyState <= WebSocket.OPEN) {
      console.debug(`${logPrefix} connect skipped (already connecting/open)`);
      return;
    }

    isExplicitDisconnect = false;
    console.debug(`${logPrefix} connecting`, { url: options.url });
    socket = new WebSocket(options.url);

    socket.onopen = () => {
      const pending = pendingMessages;
      pendingMessages = [];
      console.debug(`${logPrefix} connected`, { flushedMessages: pending.length });
      pending.forEach((message) => socket?.send(message));
      openListeners.forEach((handler) => handler());
    };

    socket.onmessage = (event) => {
      let payload: TServerMessage;
      try {
        payload = JSON.parse(String(event.data)) as TServerMessage;
      } catch (err) {
        console.error(`${logPrefix} parse error`, err);
        errorListeners.forEach((handler) =>
          handler(new ErrorEvent("error", { error: err, message: "Failed to parse message" })),
        );
        return;
      }
      console.debug(`${logPrefix} message`, payload);
      listeners.forEach((handler) => handler(payload));
    };

    socket.onerror = (event) => {
      console.error(`${logPrefix} socket error`, event);
      errorListeners.forEach((handler) => handler(event));
    };

    socket.onclose = (event) => {
      console.debug(`${logPrefix} closed`, {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      socket = null;
      if (!isExplicitDisconnect) {
        closeListeners.forEach((handler) => handler(event));
      }
    };
  };

  const disconnect = (code?: number, reason?: string) => {
    if (!socket) return;
    isExplicitDisconnect = true;
    pendingMessages = [];
    console.debug(`${logPrefix} disconnect`, { code, reason });
    socket.close(code, reason);
  };

  const send = (message: TClientMessage) => {
    const payload = typeof message === "string" ? message : JSON.stringify(message);

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      pendingMessages.push(payload);
      console.debug(`${logPrefix} queued message`, { queueSize: pendingMessages.length });
      return;
    }

    console.debug(`${logPrefix} send`, message);
    socket.send(payload);
  };

  const subscribe = (handler: WebSocketEventHandler<TServerMessage>) => {
    listeners.add(handler);
    return () => listeners.delete(handler);
  };

  const subscribeOpen = (handler: WebSocketOpenHandler) => {
    if (socket?.readyState === WebSocket.OPEN) handler();
    openListeners.add(handler);
    return () => openListeners.delete(handler);
  };

  const subscribeClose = (handler: WebSocketCloseHandler) => {
    closeListeners.add(handler);
    return () => closeListeners.delete(handler);
  };

  const subscribeError = (handler: WebSocketErrorHandler) => {
    errorListeners.add(handler);
    return () => errorListeners.delete(handler);
  };

  return {
    connect,
    disconnect,
    send,
    subscribe,
    subscribeOpen,
    subscribeClose,
    subscribeError,
    get isConnected() {
      return socket?.readyState === WebSocket.OPEN;
    },
  } as const;
};

export type WebSocketService<TServerMessage, TClientMessage = string> = ReturnType<
  typeof createWebSocketService<TServerMessage, TClientMessage>
>;
