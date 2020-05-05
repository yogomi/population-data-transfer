import fs from 'fs';

import { triangleIdFromGeoPosition } from 'common_libs/koko-triangle';

export default function createGeopopulationData(simplePopulationFilename, destinationFileName) {
  const populationData = JSON.parse(fs.readFileSync(simplePopulationFilename, 'utf8'));
  const geopopulationData = Object.values(populationData.reduce((resultData, data) => {
    const triangleId = triangleIdFromGeoPosition(data.geopoint[0], data.geopoint[1]);
    const previousPopulation = resultData[triangleId] === undefined
      ? 0 : resultData[triangleId].population;
    resultData[triangleId] = { // eslint-disable-line no-param-reassign
      triangle_id: triangleId,
      population: previousPopulation + data.population,
    };
    return resultData;
  }, {})).sort((a, b) => {
    if (a.population < b.population) {
      return 1;
    }
    return -1;
  });
  console.log(geopopulationData);
}
