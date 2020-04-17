import fetch from 'node-fetch';
const fs = require('fs');

let urlBase = 'https://public.opendatasoft.com/api/records/1.0/search/';
urlBase = `${urlBase}?dataset=worldcitiespop&sort=population&facet=country`;

async function getPopulationDatas(start, rows) {
  const url = `${urlBase}&rows=${rows}&start=${start}`;
  const datas = await (await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })).json();
  const { records } = datas;
  records.forEach((data) => {
    const { recordid } = data;
    const { population, geopoint } = data.fields;
    console.log({ recordid, population, geopoint });
  });
  return records.length;
}

async function main() {
  const rows = 100;
  let start = 0;
  let responseDataCount = rows;
  while (responseDataCount === rows) {
    responseDataCount = await getPopulationDatas(start, rows);
    console.log(start);
    start += responseDataCount;
  }
  console.log(responseDataCount);
}

main().then(() => console.log('finish'), (err) => console.error(err));
