// The build label that goes into each signed transcript (and anywhere else a version is shown).
//   1.1.0+679c4d2        the production site (branch main): release number, then the commit it was built from
//   1.1.0-dev+679c4d2    any other branch (staging is dev), with the branch name after the release number
//   1.1.0-local+nogit    built somewhere without git information
// The release number is the "version" in package.json (see docs/versioning.md). The rest is filled in by the build.
import { BUILD_INFO } from '../generated/build-info.ts';

export interface BuildInfo {
  version: string;
  commit: string;
  branch: string;
}

const clean = (s: string, max: number): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max);

export function formatBuild(info: BuildInfo): string {
  const version = /^\d+\.\d+\.\d+$/.test(info.version) ? info.version : '0.0.0';
  const branch = info.branch === 'main' || info.branch === 'master' ? '' : clean(info.branch, 16) || 'local';
  const commit = info.commit.slice(0, 7);
  return `${version}${branch ? `-${branch}` : ''}+${commit || 'nogit'}`;
}

/** An explicit COACH_BUILD (set in Netlify) wins, kept to safe characters and 40 long; otherwise the generated label. */
export function buildLabel(override: string | undefined = undefined, info: BuildInfo = BUILD_INFO): string {
  const o = (override ?? '').replace(/[^0-9A-Za-z._+-]/g, '').slice(0, 40);
  return o || formatBuild(info);
}
