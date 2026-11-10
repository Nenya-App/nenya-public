import { hostAllowed, originHint, storeNameFrom } from '../src/lib/originHosts.ts';
import { ok } from './helpers.mts';

ok('production hosts are always allowed', hostAllowed('nenya.biz') && hostAllowed('www.nenya.biz') && hostAllowed('localhost') && hostAllowed('127.0.0.1'));
ok('case is ignored', hostAllowed('NENYA.BIZ'));
ok('other hosts are refused by default', !hostAllowed('evil.example') && !hostAllowed('dev--nenya.netlify.app'));
ok('lookalike of a production host is refused', !hostAllowed('nenya.biz.evil.example') && !hostAllowed('evilnenya.biz'));

const extra = 'dev--nenya.netlify.app, deploy-preview-*--nenya.netlify.app';
ok('an exact extra host is allowed', hostAllowed('dev--nenya.netlify.app', extra));
ok('a wildcard label matches preview numbers', hostAllowed('deploy-preview-7--nenya.netlify.app', extra) && hostAllowed('deploy-preview-123--nenya.netlify.app', extra));
ok('a wildcard does not cross a dot', !hostAllowed('deploy-preview-7.evil--nenya.netlify.app', extra));
ok('another site on the same domain is refused', !hostAllowed('deploy-preview-7--other.netlify.app', extra) && !hostAllowed('dev--other.netlify.app', extra));
ok('a suffix trick is refused', !hostAllowed('dev--nenya.netlify.app.evil.example', extra) && !hostAllowed('xdev--nenya.netlify.app', extra));

ok('a bare wildcard domain is refused', !hostAllowed('anything.netlify.app', '*.netlify.app'));
ok('a wildcard with almost no literal text is refused', !hostAllowed('ab.netlify.app', '*b.netlify.app'));
ok('a lone wildcard is refused', !hostAllowed('anything.example', '*'));
ok('entries with schemes, ports or paths are refused', !hostAllowed('nenya.netlify.app', 'https://nenya.netlify.app') && !hostAllowed('nenya.netlify.app', 'nenya.netlify.app:8080') && !hostAllowed('nenya.netlify.app', 'nenya.netlify.app/x'));
ok('regex characters in an entry are treated as text', !hostAllowed('devXXnenya.netlify.app', 'dev--nenya.netlify.app') && !hostAllowed('anything', '.+'));
ok('only the first 10 entries count', !hostAllowed('h11.example.com', Array.from({ length: 11 }, (_, i) => `h${i + 1}.example.com`).join(',')));
ok('empty or missing extra hosts add nothing', !hostAllowed('x.example.com', '') && !hostAllowed('x.example.com', undefined) && !hostAllowed('x.example.com', ' , ,'));

ok('store name defaults to coach-private', storeNameFrom(undefined) === 'coach-private' && storeNameFrom('') === 'coach-private');
ok('a valid preview store name is used', storeNameFrom('coach-private-preview') === 'coach-private-preview');
ok('an unsafe store name falls back', storeNameFrom('../prod') === 'coach-private' && storeNameFrom('A B') === 'coach-private' && storeNameFrom('x'.repeat(65)) === 'coach-private');

ok('the owner\'s hint says whether the setting arrived, and how many entries were usable', /not set/.test(originHint('dev--x.netlify.app', undefined)) && /not set/.test(originHint('dev--x.netlify.app', '  ')) && /1 entry, 0 usable/.test(originHint('dev--x.netlify.app', 'https://dev--x.netlify.app')) && /2 entries, 2 usable/.test(originHint('a.example.com', 'b.example.com, c.example.com')) && /no usable Origin/.test(originHint('', undefined)));
