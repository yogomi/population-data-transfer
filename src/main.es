import fetch from 'node-fetch';
import fs from 'fs';
import cutOutPopulationData from 'population-data-transfer/cut_out_population_data';

async function main() {
  const geopopulationFileName = 'geopopulation.json';
  const geopopulationData = JSON.parse(fs.readFileSync(geopopulationFileName, 'utf8'));
  console.log(geopopulationData);
  // geopopulationData.forEach((data) => {
  //   console.log(data);
  // });
}

cutOutPopulationData('worldcitiespop.json', 'geopopulation.json');
// main();

// main().then(() => console.log('finish'), (err) => console.error(err));
