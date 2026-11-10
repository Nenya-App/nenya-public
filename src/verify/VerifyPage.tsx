import { EmergencyExitDock } from '../app/components/EmergencyExit';
import TranscriptChecker from './TranscriptChecker';

// A page for checking a signed Nenya coach-demo transcript (the .json file, or the readable .txt copy that carries it).
// Everything happens in this browser: the file is read here and checked here, and nothing is sent anywhere. The page
// counts nothing and stores nothing. (The checker itself is shared with the owner's page; see TranscriptChecker.tsx.)

export default function VerifyPage() {
  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden">
      <EmergencyExitDock show />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-10 text-foreground">
        <header className="space-y-2">
          <h1 className="text-3xl">Check a Nenya transcript</h1>
          <p className="text-sm text-muted-foreground">
            A signed transcript from the Nenya coach demo carries a signature that proves it has not been edited since it was
            made. Choose the file here (the .json file, or the readable .txt copy) and it is checked on your device. Nothing is
            uploaded, and this page keeps nothing.
          </p>
        </header>

        <TranscriptChecker />

        <footer className="space-y-2 text-sm text-muted-foreground">
          <p>
            What a valid result means, and what it does not, is explained at{' '}
            <a className="underline underline-offset-4" href="https://github.com/Nenya-App/nenya-public/blob/main/docs/coach-transcripts.md" target="_blank" rel="noopener noreferrer">
              docs/coach-transcripts.md
            </a>
            . To check the key id independently, compare it with the published list there.
          </p>
        </footer>
      </main>
    </div>
  );
}
