// Hourly: deletes every partner-practice cell older than three hours (netlify/functions/cell.mts), whether or not the two
// people closed it. It reads only each cell's opening time; it holds no secrets and cannot read any message.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { CELL_MAX_AGE_MS, closeCell } from './cell.mts';

type Store = ReturnType<typeof getStore>;

/** Deletes the cells whose time is up. Returns how many. */
export async function cleanupCells(s: Store, now = Date.now()): Promise<number> {
  const { blobs } = await s.list({ prefix: 'cell/' });
  const boxes = new Set(blobs.map((b) => b.key.split('/')[1]).filter(Boolean));
  let n = 0;
  for (const box of boxes) {
    const meta = (await s.get(`cell/${box}/meta`, { type: 'json' })) as { created?: number } | null;
    // A cell with no opening time is a leftover from an interrupted close: delete it too.
    if (!meta || typeof meta.created !== 'number' || now - meta.created > CELL_MAX_AGE_MS) {
      await closeCell(s, box);
      n++;
    }
  }
  return n;
}

export default async (): Promise<Response> => {
  try {
    const n = await cleanupCells(getStore({ name: `${storeNameFrom(process.env.COACH_STORE_NAME)}-cells`, consistency: 'strong' }));
    console.log(`cell-cleanup: deleted ${n} cell(s)`);
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(`cell-cleanup: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};

export const config = {
  schedule: '@hourly',
};
