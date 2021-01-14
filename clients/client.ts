import Websocket from 'ws';

export default function main(port: string, pid: string, cid: string):void {
  const ws = new Websocket(`ws://localhost:${port}/ws/${pid}`, {
    headers: {
      cid,
    },
  });

  ws.on('ping', () => {
    // console.log('got ping');
  });

  ws.on('message', (msg) => {
    console.log(port, pid, cid, msg);
  });
  ws.on('close', (code, reason) => {
    console.log(pid, cid, code, reason);
    main(port, pid, cid);
  });
}

if (require.main === module) {
  const [, , PORT, PID, CID] = process.argv;

  if (!PORT || typeof +PORT !== 'number') {
    throw new Error(`clent.ts PORT PID CID, PORT expected number, but value is ${PORT}`);
  }
  if (!PID) {
    throw new Error(`clent.ts PORT PID CID, PID expected number, but value is ${PID}`);
  }
  if (!CID) {
    throw new Error(`clent.ts PORT PID CID, CID expected number, but value is ${CID}`);
  }
  main(PORT, PID, CID);
}
