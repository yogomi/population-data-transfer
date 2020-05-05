// import { sendGeopopulationFromJson } from 'population-data-transfer/send_geopopulation';
import createGeopopulationData from 'population-data-transfer/create_geopopulation_data';


async function main() {
  createGeopopulationData('simple_population.json', 'geopopulation.json');
}

main();

// main().then(() => console.log('finish'), (err) => console.error(err));
