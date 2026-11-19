#!/bin/zsh
# Starts a watchable troll-arena session from a fresh shell (docs/troll-arena.md): finds the repo, checks LM Studio is up and the adversary model is there, starts the arena, opens the live page.
#
#   zsh /Users/estellestreiff/Desktop/nenya-public/scripts/run-troll-arena.sh [extra troll-arena.mts flags]
#
# Defaults: the Qwen2.5-14B abliterated v2 troll (or gemma-4-e2b-it-uncensored if it is not in LM Studio), Workers AI Gemma 4 26B as the coach, guards on and off in pairs, five random personas,
# a 3,000 Neuron ceiling. Anything you add (for example --personas all --rounds 2 --judge apertus-8b-instruct-2509) is passed on and wins over the defaults.
set -e
REPO="${NENYA_REPO:-/Users/estellestreiff/Desktop/nenya-public}"
cd "$REPO"
export PATH="$HOME/.npm-global/bin:$HOME/.lmstudio/bin:$PATH"
PORT=5230
if ! curl -fs -m 4 http://localhost:1234/v1/models >/dev/null; then
  echo "LM Studio's local server is not running. Open LM Studio, go to the Developer tab, press Start Server, then run this again."; exit 1
fi
MODELS=$(curl -fs -m 4 http://localhost:1234/v1/models)
if echo "$MODELS" | grep -qi 'qwen2.5-14b-instruct-abliterated-v2'; then
  echo "Adversary: Qwen2.5-14B abliterated v2 (about 10 GB of memory: close other heavy apps)."
else
  echo "The Qwen2.5-14B abliterated v2 model is not in LM Studio yet; the arena will use gemma-4-e2b-it-uncensored (a weaker troll)."
fi
if ! command -v cf >/dev/null && [ ! -x "$HOME/.npm-global/bin/cf" ]; then echo "The cf CLI is not installed or signed in (needed for the Workers AI coach). Use --coach local:<model> instead."; exit 1; fi
( until curl -fs -m 2 "http://127.0.0.1:$PORT/" >/dev/null 2>&1; do sleep 1; done; open "http://127.0.0.1:$PORT/" ) &
exec node scripts/troll-arena.mts "$@" --guards both --personas random:5 --port "$PORT"
