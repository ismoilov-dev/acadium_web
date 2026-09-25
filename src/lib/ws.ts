export type WsStatus = 'connecting' | 'open' | 'closed'

interface Options<T> {
  url: () => string | null
  onMessage: (data: T) => void
  onStatus?: (status: WsStatus) => void
  maxDelayMs?: number
}

/**
 * WebSocket with exponential backoff reconnect (1s → 2s → … → 30s, with jitter).
 * `url` is re-evaluated on every attempt so a refreshed token is picked up.
 */
export class ReconnectingSocket<T = unknown> {
  private ws: WebSocket | null = null
  private attempt = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private stopped = false
  private readonly opts: Options<T>

  constructor(opts: Options<T>) {
    this.opts = opts
  }

  start() {
    this.stopped = false
    this.connect()
    window.addEventListener('online', this.handleOnline)
  }

  stop() {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
    window.removeEventListener('online', this.handleOnline)
    this.ws?.close()
    this.ws = null
  }

  send(payload: unknown): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false
    this.ws.send(JSON.stringify(payload))
    return true
  }

  private handleOnline = () => {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.attempt = 0
      this.connect()
    }
  }

  private connect() {
    if (this.stopped) return
    if (this.timer) clearTimeout(this.timer)
    const url = this.opts.url()
    if (!url) return
    this.ws?.close()
    this.opts.onStatus?.('connecting')
    const ws = new WebSocket(url)
    this.ws = ws
    ws.onopen = () => {
      this.attempt = 0
      this.opts.onStatus?.('open')
    }
    ws.onmessage = (ev: MessageEvent<string>) => {
      try {
        this.opts.onMessage(JSON.parse(ev.data) as T)
      } catch {
        /* ignore non-JSON frames */
      }
    }
    ws.onclose = () => {
      if (this.ws !== ws) return
      this.opts.onStatus?.('closed')
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.stopped) return
    const max = this.opts.maxDelayMs ?? 30_000
    const delay = Math.min(max, 1000 * 2 ** this.attempt) + Math.random() * 500
    this.attempt += 1
    this.timer = setTimeout(() => this.connect(), delay)
  }
}
