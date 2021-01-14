/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import WebSocket from 'ws';

class Cabinet {
  // eslint-disable-next-line no-undef
  private readonly interval: NodeJS.Timeout;

  private readonly cid: string;

  private readonly pid: string;

  private readonly ws: WebSocket;

  constructor(ws: WebSocket, pid: string, cid: string) {
    this.cid = cid;
    this.pid = pid;
    this.ws = ws;
    ws.on('close', this.close.bind(this));
    this.interval = setInterval(() => {
      try {
        ws.ping();
      } catch (e) { console.log(`cabinet ${cid} ping has error`); }
    }, 10000);
  }

  close() {
    this.ws.close();
    clearInterval(this.interval);
  }
}

export default class Station extends EventEmitter {
  private readonly cabinetsStore = new Map<string, Cabinet>();

  private readonly pid;

  constructor(pid: string) {
    super();
    this.pid = pid;
  }

  get cabinets(): string[] {
    const cs = [];
    const iterator = this.cabinetsStore.keys();
    let nextValue = iterator.next();
    while (nextValue.done !== undefined && !nextValue.done) {
      cs.push(nextValue.value);
      nextValue = iterator.next();
    }
    return cs;
  }

  get size(): number {
    return this.cabinetsStore.size;
  }

  remove(cid: string): boolean {
    const cabinet = this.cabinetsStore.get(cid);
    if (cabinet) {
      cabinet.close();
    }
    return this.cabinetsStore.delete(cid);
  }

  removeAll(): void {
    this.cabinetsStore.forEach((cabinet) => {
      cabinet.close();
    });
  }

  add(cid: string, ws: WebSocket):boolean {
    const cabinet = this.cabinetsStore.get(cid);
    if (cabinet) {
      return false;
    }
    const newCabinet = new Cabinet(ws, this.pid, cid);
    ws.on('close', () => {
      newCabinet.close();
      this.emit('cabinetClose', cid);
      this.cabinetsStore.delete(cid);
    });
    this.cabinetsStore.set(cid, newCabinet);
    return true;
  }
}
