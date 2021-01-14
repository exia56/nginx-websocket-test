import { program } from 'commander';
import wsClient from './client';

const randomString = () => Math.random().toString(36).substr(-6).toUpperCase();

program.requiredOption('-p, --ports <port...>', 'ports ranges')
  .option('-s, --station-prefix <station id prefix>', 'station id prefix, default random string', randomString())
  .option('-c, --cabinet-prefix <cabinet id prefix>', 'cabinet id prefix, default random string', randomString())
  .option('-sc, --station-count <station count = 1>', 'generate how many stations', '1')
  .option('-cc, --cabinet-count <station count = 1>', 'generate how many cabinets under the station', '1');

const command = program.parse(process.argv);

const {
  ports,
  stationPrefix,
  cabinetPrefix,
  stationCount,
  cabinetCount,
} = {
  ...command.opts(),
  stationCount: Number.isNaN(+command.opts().stationCount) ? 1 : +command.opts().stationCount,
  cabinetCount: Number.isNaN(+command.opts().cabinetCount) ? 1 : +command.opts().cabinetCount,
} as {
  ports: string[],
  stationPrefix: string,
  cabinetPrefix: string,
  stationCount: number,
  cabinetCount: number,
};

console.log(`connecting to ports: ${ports}, station prefix: ${stationPrefix}, cabinet prefix: ${cabinetPrefix}, total station: ${stationCount}, total cabinet of station: ${cabinetCount}`);

ports.forEach((port) => {
  Array.from({ length: stationCount }).forEach((_, idx) => {
    const stationId = `${stationPrefix}-${idx}`;
    Array.from({ length: cabinetCount }).forEach((_, cabinetIdx) => {
      const cabinetId = `${cabinetPrefix}-${idx}-${cabinetIdx}`;
      wsClient(port, stationId, cabinetId);
    });
  });
});
