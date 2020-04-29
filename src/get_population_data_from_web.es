import fetch from 'node-fetch';

let urlBase = 'https://public.opendatasoft.com/api/records/1.0/search/';
urlBase = `${urlBase}?dataset=worldcitiespop&sort=population&facet=country`;

export default async function getPopulationDatas(start, rows) {
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
