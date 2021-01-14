import express, { Request, Response } from 'express';
import expressWS from 'express-ws';
import BodyParser from 'body-parser';
import WebSocket from 'ws';
import Station from './station';

const { app } = expressWS(express());

app.use(BodyParser.json());

const { PORT } = process.env;
if (!PORT || typeof +PORT !== 'number') {
  throw new Error(`ENV PORT should not be ${PORT}, expected number`);
}

const stationsMap = new Map<string, Station>();

app.ws('/ws/:pid/', (ws: WebSocket, req: Request) => {
  const { pid } = req.params;
  const { cid } = req.headers;

  if (!cid || typeof cid !== 'string') {
    ws.send('headers.cid should be string');
  }
  let station = stationsMap.get(pid);
  if (!station) {
    station = new Station(pid);
    station.on('cabinetClose', (closeCid: string) => {
      console.log(pid, closeCid, 'close');
    });
    stationsMap.set(pid, station);
  }
  const isSuccess = station.add(cid as string, ws);
  ws.send(`success: ${isSuccess}`);
  if (!isSuccess) {
    ws.close();
  }
  console.log(pid, cid, 'connected', isSuccess);
});

app.get('/info', (req: Request, res: Response) => {
  let totalConnections = 0;
  const stationResults = {} as Record<string, {size:number, cabinets: number}>;
  stationsMap.forEach((value: Station, key: string) => {
    if (!value.size) return;
    stationResults[key] = {
      size: value.size,
      cabinets: value.cabinets.length,
    };
    totalConnections += value.size;
  });
  res.json({
    totalConnections,
    stationMap: stationResults,
    stationCount: Object.keys(stationResults).length,
  });
});

app.delete('/all', (req: Request, res: Response) => {
  console.log('deleting all');
  stationsMap.forEach((station) => {
    station.removeAll();
  });

  res.json({});
});
app.delete('/:pid/:cid', (req: Request, res: Response) => {
  const { pid, cid } = req.params;
  console.log('deleting', pid, cid);
  const station = stationsMap.get(pid);

  res.json({ deleted: station ? station.remove(cid) : false });
});

app.listen(PORT, () => {
  console.log(`start listening on ${PORT}`);
});
