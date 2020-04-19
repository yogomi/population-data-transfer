import fs from 'fs';

export default function cutOutPopulationData(sourceFileName, destinationFileName) {
  const src = fs.createReadStream(sourceFileName, 'utf8');
  const dest = fs.createWriteStream(destinationFileName, 'utf8');
  dest.write('[\n');
  let isFirstData = true;
  let previousRestData = '';
  src.on('data', (data) => {
    let nextRecordidIndex = -2;
    const fullData = `${previousRestData}${data}`;
    let firstChallenge = true;
    while (nextRecordidIndex !== -1) {
      const indexes = {
        recordidStart: -1,
        recordidEnd: -1,
        geopointStart: -1,
        geopointEnd: -1,
        populationStart: -1,
        populationEnd: -1,
      };
      indexes.recordidStart = fullData.indexOf('recordid', nextRecordidIndex - 1);
      indexes.recordidEnd = fullData.indexOf(',', indexes.recordidStart + 1);
      nextRecordidIndex = fullData.indexOf('recordid', indexes.recordidStart + 1);
      if (nextRecordidIndex === -1) {
        if (firstChallenge) {
          previousRestData = data.slice(-200);
        }
        return;
      }
      indexes.geopointStart = fullData.indexOf('geopoint', indexes.recordidStart + 1);
      indexes.geopointEnd = fullData.indexOf(']', indexes.geopointStart) + 1;
      indexes.populationStart = fullData.indexOf('population', indexes.recordidStart + 1);
      indexes.populationEnd = fullData.indexOf(',', indexes.populationStart);
      const lastCheckPoint = nextRecordidIndex;
      if (Object.values(indexes).every((index) => {
        if (index <= lastCheckPoint && index !== -1) {
          return true;
        }
        return false;
      })) {
        if (fullData[indexes.populationEnd - 1] === '}') {
          indexes.populationEnd -= 1;
        }
        const recordid = fullData.slice(indexes.recordidStart, indexes.recordidEnd);
        const geopoint = fullData.slice(indexes.geopointStart, indexes.geopointEnd);
        const population = fullData.slice(indexes.populationStart, indexes.populationEnd);
        if (isFirstData) {
          isFirstData = false;
        } else {
          dest.write(',\n');
        }
        dest.write(`  {"${recordid}, "${geopoint}, "${population}}`);
        previousRestData = fullData.slice(indexes.populationEnd);
        firstChallenge = false;
      }
    }
  });
  src.on('error', (err) => console.log(err));
  src.on('end', () => {
    dest.write('\n]');
    dest.end();
  });
}
