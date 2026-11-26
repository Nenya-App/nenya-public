---
number: 2
slug: get-the-code
title: Get the code and light it up
summary: Download your copy, set it up, and open it in your browser.
status: approved
files: README.md, package.json
---

## Check Node.js

Install Node.js from [nodejs.org](https://nodejs.org) first. Then open a command window.

- **Mac:** open the app called Terminal.
- **Windows:** open the app called Command Prompt.
- **Linux:** open your terminal app.

Type this and press Return:

```bash
node --version
```

You should see a number that starts with `v24` or higher. If the number is lower, or you see "not found", install version 24 from nodejs.org, close the window, open a new one, and try again.

## Download the code

1. Open [the project page on GitHub](https://github.com/Nenya-App/nenya-public).
2. Press the green button called Code.
3. Choose Download ZIP.
4. Open the ZIP file to unpack it. You get a folder called `nenya-public-main`.
5. Move that folder to a place you will remember.

If you already use git, you can clone the project in place of the ZIP.

## Go into the folder

In the command window, type `cd` and then a space. Do not press Return yet. Drag the folder from your file window onto the command window. The folder's address appears. Now press Return.

If you type the address yourself and it has spaces in it, put quote marks around it:

```bash
cd "My Forge/nenya-public-main"
```

On Windows, if your folder is on another drive, such as D, type `cd /d` in place of `cd`.

## Get the parts

This step needs the internet. It downloads the parts the site is built from. It can take a few minutes.

```bash
npm install
```

You should see a line that says how many packages were added. Some yellow warnings are normal.

## Light it up

```bash
npm run dev
```

You should see an address that starts with `http://localhost`. Open that address in your web browser. You should see the logo glow and breathe.

The address works only on your own computer.

## Stop it

Go back to the command window. Hold the Control key and press C. On Windows, it may ask "Terminate batch job (Y/N)?" Type Y and press Return. The site stops. To start it again, go into the folder and run `npm run dev` once more.

The same steps are in [`README.md`](https://github.com/Nenya-App/nenya-public/blob/main/README.md), under "Running it locally". The list of parts is in [`package.json`](https://github.com/Nenya-App/nenya-public/blob/main/package.json).
