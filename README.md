# Free CV Builder

A free resume and CV builder for job seekers worldwide (US, UK, Europe, the
Gulf, Pakistan and elsewhere). The PDF download is never paywalled.

"Free CV Builder" is a placeholder wordmark. The real brand name and domain
are not chosen yet.

Static site: plain HTML, CSS and vanilla JavaScript. No build step, no
framework, no server, no database.

## Pages

| Path | Purpose |
|---|---|
| `index.html` | Landing page |
| `builder.html`, `script.js` | The builder: form, live A4 preview, four templates, PDF export through the browser print dialog, autosave to `localStorage`, JSON backup export and import |
| `guides/` | Guide hub and seven articles (CV vs resume, ATS tips, US, UK, Europass, Gulf, Pakistan) |
| `about.html`, `contact.html`, `privacy-policy.html` | Trust and legal pages |
| `styles.css` | All styles |
| `sitemap.xml`, `robots.txt`, `vercel.json` | Crawl and hosting config |

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Ad slots (builder page)

Three empty placeholders with fixed sizes, so the layout does not shift when
ad code is added later. There is no AdSense script in the site yet.

| ID | Size | Shown when |
|---|---|---|
| `#ad-rail-right` | 160x600 | viewport at least 1440px wide and 700px tall |
| `#ad-rail-left` | 160x600 | viewport at least 1640px wide and 700px tall |
| `#ad-bottom` | 728x90 (320x50 under 768px wide) | always, below the builder |

The form (420px) and the A4 preview need about 1262px between them, so a rail
cannot fit below 1440px without squeezing one of them. The rails never
overlap or shrink the form or preview.

Open `builder.html?preview=1` to see the slots outlined.

## Post-download panel

After "Download PDF" the builder shows a panel in the same tab with a backup
prompt, a link to the ATS guide, and affiliate offer cards.

Each offer card in `builder.html` has `href="#"` and a `TODO` comment. A card
with `href="#"` is hidden from visitors, and the whole "Recommended tools"
block is hidden while no card has a real link. Replace the `href` with the
approved affiliate link to switch a card on. `?preview=1` shows the
placeholder cards.

## Before going live

- Replace `REPLACE-WITH-YOUR-DOMAIN` everywhere (canonical tags, Open Graph
  URLs, `sitemap.xml`, `robots.txt`, the contact email address).
- Replace the "Free CV Builder" wordmark once the brand is chosen.
- Finish `privacy-policy.html`: it still contains `[INSERT ...]` placeholders
  and is not a complete legal document.
- Add a real logo and favicon.

## Deploy on Vercel

1. vercel.com, New Project, import this repository.
2. Framework preset "Other", no build command, output directory left as the
   repository root.

Page URLs keep their `.html` extension (`cleanUrls` is off) so that they
match the canonical tags and the sitemap.

## Monetization sequence

1. Deploy and let the site collect organic traffic.
2. Apply for AdSense once there is real content and traffic.
3. After approval, put the AdSense code into the three ad slots.
4. Join affiliate programs and replace the placeholder links one by one.
