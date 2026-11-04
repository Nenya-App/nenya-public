// What the site may keep on a device: the opt-in gate, validation, Forget, Emergency Exit, blocked storage.
const store:Record<string,string>={};
(globalThis as any).localStorage={ get length(){return Object.keys(store).length}, key:(i:number)=>Object.keys(store)[i]??null,
  getItem:(k:string)=>k in store?store[k]:null, setItem:(k:string,v:string)=>{store[k]=String(v)}, removeItem:(k:string)=>{delete store[k]} };
(globalThis as any).window={addEventListener(){},removeEventListener(){}};
import { ok } from './helpers.mts';
const dm = await import('../src/lib/deviceMemory.ts');
// internals: usePref needs React; test pieces directly
ok('off by default',!dm.isRemembering());
ok('loadPrefs empty when off',Object.keys(dm.loadPrefs()).length===0);
ok('terms not accepted when off',!dm.termsAcceptedFor('X'));
dm.rememberTerms('X'); ok('rememberTerms is a no-op when off', store['nenya.terms']===undefined);
dm.setRemembering(true); ok('on',dm.isRemembering());
dm.rememberTerms('October 31, 2026'); ok('terms accepted for exact version',dm.termsAcceptedFor('October 31, 2026')&&!dm.termsAcceptedFor('November 1, 2026'));
store['nenya.prefs']=JSON.stringify({theme:'light',textSize:18,breathingOpacity:5,colorBlindMode:'evil',breathingTechnique:{ih:5000,hi:0,ex:5000,ho:0},junk:1,logoVisible:'yes',orbitEnabled:false});
const p=dm.loadPrefs();
ok('valid values kept',p.theme==='light'&&p.textSize===18&&p.orbitEnabled===false&&p.breathingTechnique?.ih===5000);
ok('invalid values dropped',p.breathingOpacity===undefined&&p.colorBlindMode===undefined&&p.logoVisible===undefined&&!('junk' in p));
store['nenya.prefs']='{not json'; ok('corrupt prefs tolerated',Object.keys(dm.loadPrefs()).length===0);
store['nenya.prefs']=JSON.stringify({breathingTechnique:{ih:0,hi:0,ex:5000,ho:0}}); ok('zero inhale rejected',dm.loadPrefs().breathingTechnique===undefined);
// wipe
store['nenya.coach.rest']='123'; store['nenya.coach.owner']='1'; store['nenya_terms_agreed']='true'; store['nenya-theme']='dark'; store['other.site']='keep';
dm.wipeDevice({keepOwner:true});
ok('forget clears nenya keys but keeps owner + others', !store['nenya.coach.rest']&&!store['nenya.prefs']&&!store['nenya.remember']&&!store['nenya_terms_agreed']&&!store['nenya-theme']&&store['nenya.coach.owner']==='1'&&store['other.site']==='keep');
dm.setRemembering(true); dm.wipeDevice({keepOwner:false}); ok('emergency wipe removes owner flag too',store['nenya.coach.owner']===undefined&&!dm.isRemembering());
// turning off erases saved settings
dm.setRemembering(true); store['nenya.prefs']='{"textSize":18}'; dm.rememberTerms('V'); dm.setRemembering(false);
ok('turning off erases prefs + terms',store['nenya.prefs']===undefined&&store['nenya.terms']===undefined);
// blocked storage
(globalThis as any).localStorage={ get length(){throw new Error('x')}, getItem(){throw new Error('x')}, setItem(){throw new Error('x')}, removeItem(){throw new Error('x')}, key(){throw new Error('x')} };
let threw=false; try{ dm.setRemembering(true); dm.wipeDevice({keepOwner:false}); dm.loadPrefs(); dm.rememberTerms('x'); }catch{threw=true}
ok('blocked storage never throws',!threw);
