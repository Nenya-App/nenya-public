#!/usr/bin/env node
// Verifies a signed Nenya coach-demo transcript (the .json download).
//
//   node scripts/verify-transcript.mjs transcript.json [expected-key-id]
//
// Checks that (1) the transcript still hashes to the value in the receipt and
// (2) the signature over that hash and the date is valid for the receipt's key.
// To trust the result you must also know that the key is really Nenya's: pass the
// key ID published in docs/coach-transcripts.md as the second argument.
import { readFileSync } from 'node:fs';
import { createHash, createPublicKey, verify } from 'node:crypto';

const [file, expectedKeyId] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/verify-transcript.mjs transcript.json [expected-key-id]');
  process.exit(2);
}

const fail = (why) => {
  console.error(`NOT VALID: ${why}`);
  process.exit(1);
};

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch {
  fail('the file is not readable JSON');
}
const { transcript, receipt } = data ?? {};
if (!transcript || !receipt) fail('missing "transcript" or "receipt"');

const hash = createHash('sha256').update(JSON.stringify(transcript)).digest('hex');
if (hash !== receipt.hash) fail('the transcript has been changed since it was signed (hash mismatch)');

let signatureOk = false;
try {
  signatureOk = verify(
    null,
    Buffer.from(`nenya-coach-transcript-v2\n${receipt.hash}\n${receipt.issuedAt}`),
    createPublicKey({ key: Buffer.from(receipt.publicKey, 'base64'), format: 'der', type: 'spki' }),
    Buffer.from(receipt.signature, 'base64')
  );
} catch {
  signatureOk = false;
}
if (!signatureOk) fail('the signature does not match (the transcript, date, or key was altered)');

const keyId = createHash('sha256').update(receipt.publicKey).digest('hex').slice(0, 16);
if (keyId !== receipt.keyId) fail('the key ID does not match the key');
if (expectedKeyId && expectedKeyId !== keyId) fail(`signed by a different key (${keyId}), not ${expectedKeyId}`);

console.log('VALID');
console.log(`  Signed on: ${receipt.issuedAt}`);
console.log(`  Key ID:    ${keyId}${expectedKeyId ? ' (matches the one you expected)' : ' (confirm this against the published key ID)'}`);
console.log(`  Session:   ${transcript.session?.color1}.${transcript.session?.color2} (a temporary label, not an identity)`);
console.log(`  Messages:  ${transcript.messages.length}`);
