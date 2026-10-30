import { getSite } from '../../lib/data.js';

/* 브라우저의 필터 · 검색 · 더 보기가 읽는 전체 작품 목록 (가볍게 줄인 형태) */
export async function GET() {
  const { PORT, MATS } = await getSite();
  const body = {
    v: 1,
    mats: MATS.map((m) => ({ id: m.id, no: m.no, en: m.en, kr: m.kr, c: m.layers[0][2] })),
    works: PORT.map((w) => {
      const r = { p: w.pid, n: w.name, m: w.mats, o: w.order };
      if (w.types.length) r.u = w.types;
      if (w.purposes.length) r.c = w.purposes;
      if (w.regions.length) r.r = w.regions;
      if (w.keywords.length) r.k = w.keywords;
      if (w.year) r.y = w.year;
      if (w.client) r.cl = w.client;
      if (w.tags.length) r.t = w.tags;
      if (w.img) { r.i = w.img; r.s = w.srcset; r.w = w.w; r.h = w.h; }
      if (w.alt) r.a = w.alt;
      return r;
    }),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
