import fetch from 'node-fetch';
import fs from 'fs';

function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, msec);
  });
}

export async function sendGeopopulationFromJson(url, jsonDataFilename) {
  const geopopulationData = JSON.parse(fs.readFileSync(jsonDataFilename, 'utf8'));

  console.log(url);
  let index = 0;
  while (index !== geopopulationData.length) {
    let endIndex = index + 100;
    if (geopopulationData.length - endIndex < 0) endIndex = geopopulationData.length;

    // eslint-disable-next-line no-await-in-loop
    const result = await (await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geopopulationData.slice(index, endIndex)),
    })).json();

    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    console.log(result, index, endIndex);
    index = endIndex;
  }
}
