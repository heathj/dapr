interface WebSocketClientOptions {
  onMessage(e: MessageEvent): void;
  onClose(): void;
  onError(): void;
}
export const useWebSocket = (url: string) => {
  let websocket: WebSocket | null = null;
  const sendMessage = (message: string) => {
    if (!websocket) {
      return;
    }
    websocket.send(message);
  };
  const connect = (options: WebSocketClientOptions) => {
    websocket = new WebSocket(url);
    websocket.onopen = () => {
      console.log("opened ws");
    };
    websocket.onmessage = (e: MessageEvent) => {
      options.onMessage(e);
    };
    websocket.onclose = options.onClose;
    websocket.onerror = options.onError;
  };
  const disconnect = () => {
    if (!websocket) {
      return;
    }
    websocket.close();
    websocket = null;
  };

  const toggleConnect = (options: WebSocketClientOptions) => {
    if (!websocket) {
      connect(options);
    } else {
      disconnect();
    }
  };

  return [toggleConnect, sendMessage];
};
