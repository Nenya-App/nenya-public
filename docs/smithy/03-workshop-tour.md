---
number: 3
slug: workshop-tour
title: A tour of the workshop
summary: Find the file that holds the thing you want to change.
status: approved
files: README.md, src/app/App.tsx, src/lib, src/app/components, src/styles/globals.css, public, netlify/functions, docs/README.md
---

## The main folders

Open your project folder. These are the places you will use most.

| Folder or file | What is in it |
|---|---|
| `src/app/App.tsx` | The front door. It picks which screen to show. |
| `src/app/components` | The screens and buttons you see. |
| `src/app/components/pages` | The welcome screen, the Lenses and the report. |
| `src/lib` | The shared rules: sounds, breath paces, saved settings, the report. |
| `src/styles/globals.css` | The colors and the look. |
| `public` | Pictures, icons, fonts and plain files. |
| `netlify/functions` | Server code. Your private copy does not run it. |
| `docs` | Notes on how and why parts were made. |

## How to find a thing

Say you see some words on the screen and want to change them. Search the whole `src` folder for those words.

**Mac and Linux:** in the command window, inside your project folder, type:

```bash
grep -rn "Take a Moment to Breathe" src index.html
```

**Windows:** in Command Prompt, inside your project folder, type:

```bash
findstr /s /n /c:"Take a Moment to Breathe" src\* index.html
```

Each line of the answer shows a file name and a line number. Open that file in your editor and go to that line.

## Notes at the top of files

Most files start with a short note that says what the file does and what it keeps. Read it before you change anything.

## Where to read more

- [`README.md`](https://github.com/Nenya-App/nenya-public/blob/main/README.md) has a "Project layout" list.
- [`docs/README.md`](https://github.com/Nenya-App/nenya-public/blob/main/docs/README.md) is the list of all the notes.

You can also browse [`src/app/App.tsx`](https://github.com/Nenya-App/nenya-public/blob/main/src/app/App.tsx), [`src/app/components`](https://github.com/Nenya-App/nenya-public/blob/main/src/app/components) and [`src/lib`](https://github.com/Nenya-App/nenya-public/blob/main/src/lib) on GitHub.
