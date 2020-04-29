import { sendGeopopulationFromJson } from 'population-data-transfer/send_geopopulation';

async function main() {
  sendGeopopulationFromJson('http://localhost:4001/api/v1/geopopulation', 'geopopulation.json');
}

main();

// main().then(() => console.log('finish'), (err) => console.error(err));
