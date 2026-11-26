# Tallers Garcia Vilanova — website

Static, trilingual (Catalan default, Spanish, English) site for a car workshop and
dealer at Ronda d'Europa, 21-23, Vilanova i la Geltrú.

## Build

```sh
node scripts/build.mjs     # src/template.html + src/i18n/*.json -> index.html, es/, en/, sitemap
node scripts/verify.mjs    # headless checks: SEO, a11y, layout, consent gate (117 assertions)
node scripts/assets.mjs    # favicon, PWA icons, OG image
node scripts/card.mjs      # assets/photos/handover.png, 10.5 x 14.5 cm at 300 dpi + QR
```

`node_modules` is a symlink to a shared workspace install; nothing is committed from it.

## Structure

```
src/data.json          business facts (address, phone, rating, reviews, coords)
src/locales.json       locale list: code, output dir, hreflang, default flag
src/i18n/<code>.json   all user-facing copy, one file per locale
src/template.html      the page; every hole resolves from data + dictionary
assets/css/styles.css  palette and layout
assets/js/main.js      nav drawer, reveal-on-scroll, consent + map gate
scripts/               build, verify, assets, card (no business values inside)
```

## Notes

- **Images:** the hero photo is the business's own Google listing photo, credited in the
  caption as the attribution requires. `assets/img/mark.svg` is the logo mark used for the
  favicon and PWA icons.
- **Reviews:** testimonials are extracts of published Google reviews, rewritten into the
  language of each page. Only positive reviews are quoted, and the copy states plainly that
  the 4.1/365 average is not perfect.
- **Privacy:** no analytics or map request is made before consent. The Google Analytics tag
  is defined with `storage: denied` and only loads after the visitor accepts; the map iframe
  is injected from a `<template>` on the same decision. Rejecting leaves zero third-party
  cookies and zero requests to Google.
- **SEO:** canonical, `og:url`, hreflang alternates and `sitemap.xml` all derive from one
  origin constant; JSON-LD is `AutoDealer` with address, geo and aggregate rating.
- **Accessibility:** single `h1`, skip link, visible focus rings, `aria-expanded` on the nav
  toggle with Escape to close, all images with alt text, body text at WCAG AA contrast.
- **No tracking of provenance:** the repository holds no data-source references or keys.
