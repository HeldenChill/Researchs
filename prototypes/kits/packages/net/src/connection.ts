export interface ConnectionOptions {
  queueWhileConnecting?: boolean;
}

export class Connection {
  private ws: WebSocket;
  private pending: (string | Uint8Array)[] = [];
  private readonly queueWhileConnecting: boolean;

  onOpen: () => void = () => {};
  onText: (s: string) => void = () => {};
  onBinary: (data: Uint8Array) => void = () => {};
  onClose: (code: number, reason: string) => void = () => {};

  constructor(url: string, opts?: ConnectionOptions) {
    this.queueWhileConnecting = opts?.queueWhileConnecting ?? true;
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.onOpen();
      for (const item of this.pending) {
        this.ws.send(item);
      }
      this.pending = [];
    };

    this.ws.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        this.onText(ev.data);
      } else if (ev.data instanceof ArrayBuffer) {
        this.onBinary(new Uint8Array(ev.data));
      } else if (ev.data instanceof Uint8Array) {
        this.onBinary(ev.data);
      }
    };

    this.ws.onclose = (ev) => {
      this.pending = [];
      this.onClose(ev.code, ev.reason);
    };
  }

  get open(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }

  send(data: string | Uint8Array, queue?: boolean): void {
    const shouldQueue = queue ?? this.queueWhileConnecting;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else if (shouldQueue && this.ws.readyState === WebSocket.CONNECTING) {
      this.pending.push(data);
    }
  }

  close(): void {
    this.onClose = () => {};
    this.pending = [];
    try {
      this.ws.close();
    } catch {}
  }
}
