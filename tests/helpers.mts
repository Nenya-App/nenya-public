// Shared by every test file: prints PASS/FAIL lines and makes the process exit non-zero on any FAIL.
export function ok(name: string, cond: boolean, extra = '') {
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (extra ? '  ' + extra : ''));
  if (!cond) process.exitCode = 1;
}
