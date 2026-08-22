# Nenya

A free, private, browser-based tool for structured personal reflection —
resonance breathing paired with six optional sensory "gateways" (Sight,
Sound, Touch, Essence, Movement, Insight) for checking in with an emotional
state without having to name it in words first.

Live at [nenya.biz](https://nenya.biz).

Nenya is not a medical device or a substitute for professional care — see
the in-app Terms of Use for the full statement, including crisis resources.

## Why this exists

Nothing typed or chosen in a session is tracked, stored, or sold — not as a
policy promise, but as an architectural fact: there is no backend, no
analytics, and no third-party network calls in this codebase. Session
summaries are generated and downloaded locally, by the visitor, for their
own use. It's free, ad-free, and requires no account, and it's built to
stay that way — see [`TRADEMARK.md`](./TRADEMARK.md) for how the license
enforces that.

Nenya is fiscally sponsored by [Fractured Atlas](https://www.fracturedatlas.org),
a 501(c)(3) public charity. It accepts no equity investors.

## Running it locally

```bash
npm install
npm run dev
```

Then build for production with:

```bash
npm run build
```

This is a static Vite + React + TypeScript app — `npm run build` outputs a
fully static `dist/` directory with no server-side component required to
serve it.

## License

The source code in this repository is licensed under the
[GNU Affero General Public License v3.0](./LICENSE) or later.

The "Nenya" name and logo are **not** covered by that license — see
[`TRADEMARK.md`](./TRADEMARK.md) for what that does and doesn't allow.

## Contributing

Please read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before opening an
issue or pull request.

---

<a href="https://www.netlify.com">
  <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" width="120" />
</a>
