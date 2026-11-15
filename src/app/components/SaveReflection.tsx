import { createContext, useContext, useEffect, useId, useState, type FormEvent } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { SAVE_COPY } from '../../lib/saveCopy';
import type { SaveResult } from '../../lib/savedReflection';

// "Save and return later" (docs/save-and-return-scope.md). The App provides what is needed; the gateway header and the review page show
// the link wherever there is something finished to save. The panels are real forms (a username field holding the session ID and a
// password field), so a password manager can offer to keep both; nothing blocks pasting (WCAG 2.2 3.3.8).

export interface SaveReflectionApi {
  /** VITE_SAVE_REFLECTION=on. */
  on: boolean;
  /** At least one finished gateway. */
  canSave: boolean;
  sessionId: string;
  save: (passcode: string) => Promise<SaveResult>;
  open: (id: string, passcode: string) => Promise<boolean>;
}

export const SaveReflectionContext = createContext<SaveReflectionApi | null>(null);

function PasscodeField({ id, value, onChange, show, autoComplete }: { id: string; value: string; onChange: (v: string) => void; show: boolean; autoComplete: 'new-password' | 'current-password' }) {
  return (
    <input
      id={id}
      name="password"
      type={show ? 'text' : 'password'}
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-base"
    />
  );
}

/** The link and its panel for saving. Shows nothing unless saving is on and something is finished. */
export function SaveReflectionLink({ className = '' }: { className?: string }) {
  const api = useContext(SaveReflectionContext);
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | SaveResult>('idle');
  const [copied, setCopied] = useState(false);
  const uid = useId();
  useEffect(() => {
    if (!open) {
      setPass('');
      setShow(false);
      setState('idle');
      setCopied(false);
    }
  }, [open]);
  if (!api?.on || !api.canSave) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pass) {
      setState('invalid');
      return;
    }
    setState('saving');
    setState(await api.save(pass));
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(api.sessionId);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`min-h-11 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground ${className}`}>
        {SAVE_COPY.link}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{SAVE_COPY.title}</DialogTitle>
            <DialogDescription>{SAVE_COPY.intro}</DialogDescription>
          </DialogHeader>
          {state === 'saved' ? (
            <div className="space-y-3 text-sm">
              <p role="status">{SAVE_COPY.saved}</p>
              <p className="font-mono">{api.sessionId}</p>
              <Button onClick={() => setOpen(false)} className="min-h-11">{SAVE_COPY.close}</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label htmlFor={`${uid}-id`} className="block">{SAVE_COPY.idLabel}</label>
                <div className="flex gap-2">
                  <input id={`${uid}-id`} name="username" type="text" autoComplete="username" readOnly value={api.sessionId} className="min-h-11 w-full rounded-md border border-border bg-muted px-3 font-mono text-base" aria-describedby={`${uid}-idhelp`} />
                  <Button type="button" variant="outline" onClick={copy} className="min-h-11 shrink-0">{copied ? SAVE_COPY.copied : SAVE_COPY.copy}</Button>
                </div>
                <p id={`${uid}-idhelp`} className="text-xs text-muted-foreground">{SAVE_COPY.idHelp}</p>
              </div>
              <div className="space-y-1">
                <label htmlFor={`${uid}-pass`} className="block">{SAVE_COPY.passLabel}</label>
                <PasscodeField id={`${uid}-pass`} value={pass} onChange={setPass} show={show} autoComplete="new-password" />
                <p className="text-xs text-muted-foreground">{SAVE_COPY.passHelp}</p>
                <label className="flex min-h-11 items-center gap-2 text-xs">
                  <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
                  {SAVE_COPY.show}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">{SAVE_COPY.half} {SAVE_COPY.limits}</p>
              {state === 'invalid' && <p role="alert" className="text-destructive">{SAVE_COPY.invalid}</p>}
              {state === 'no-space' && <p role="alert" className="text-destructive">{SAVE_COPY.noSpace}</p>}
              <Button type="submit" disabled={state === 'saving'} className="min-h-11">{SAVE_COPY.save}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** The quiet link for returning. Shown whether or not anything is saved, so it never says that something is. */
export function ContinueSavedLink({ className = '' }: { className?: string }) {
  const api = useContext(SaveReflectionContext);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [state, setState] = useState<'idle' | 'opening' | 'not-found'>('idle');
  const uid = useId();
  useEffect(() => {
    if (!open) {
      setId('');
      setPass('');
      setShow(false);
      setState('idle');
    }
  }, [open]);
  if (!api?.on) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('opening');
    const ok = await api.open(id, pass);
    if (ok) setOpen(false);
    else setState('not-found');
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`min-h-11 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground ${className}`}>
        {SAVE_COPY.continueLink}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{SAVE_COPY.continueTitle}</DialogTitle>
            <DialogDescription>{SAVE_COPY.continueIntro}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 text-sm">
            <div className="space-y-1">
              <label htmlFor={`${uid}-id`} className="block">{SAVE_COPY.idLabel}</label>
              <input id={`${uid}-id`} name="username" type="text" autoComplete="username" spellCheck={false} autoCapitalize="none" value={id} onChange={(e) => setId(e.target.value)} className="min-h-11 w-full rounded-md border border-border bg-background px-3 font-mono text-base" />
            </div>
            <div className="space-y-1">
              <label htmlFor={`${uid}-pass`} className="block">{SAVE_COPY.passLabel}</label>
              <PasscodeField id={`${uid}-pass`} value={pass} onChange={setPass} show={show} autoComplete="current-password" />
              <label className="flex min-h-11 items-center gap-2 text-xs">
                <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
                {SAVE_COPY.show}
              </label>
            </div>
            {state === 'not-found' && <p role="alert">{SAVE_COPY.notFound}</p>}
            <Button type="submit" disabled={state === 'opening'} className="min-h-11">{SAVE_COPY.open}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
