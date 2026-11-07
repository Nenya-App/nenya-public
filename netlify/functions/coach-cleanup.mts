// A small daily job: deletes the previous days' connection records (see src/lib/connectionLimit.ts), so that
// none outlives about a day and a half, as the Terms promise. It holds no secrets and reads no message text.
import { getStore } from '@netlify/blobs';
import { storeNameFrom } from '../../src/lib/originHosts.ts';
import { cleanupConnectionRecords } from '../../src/lib/connectionLimit.ts';

export default async (): Promise<Response> => {
  try {
    const n = await cleanupConnectionRecords(getStore(storeNameFrom(process.env.COACH_STORE_NAME)));
    console.log(`coach-cleanup: deleted ${n} old connection record(s)`);
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error(`coach-cleanup: failed ${e instanceof Error ? e.name : 'error'}`);
    return new Response(null, { status: 500 });
  }
};

// Literal values on purpose: Netlify reads this block by static analysis. 08:00 UTC is after the Minnesota day has
// turned over in both winter and summer time.
export const config = {
  schedule: '0 8 * * *',
};
