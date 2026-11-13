# CV Pakistan — Free Resume/CV Builder (MVP)

Zero-backend, zero-dependency resume builder aimed at Pakistan's job market
and Gulf applications. Pure HTML/CSS/vanilla JS — no build step, no framework,
no server, no database. Deploys as a static site for free.

## Why this exists (validated gap)

Checked Nov 2026: Zety free tier only exports unformatted TXT (PDF needs
$25.95/4wk after a $1.95 trial). Novorésumé free tier caps you at a 1-page,
1-version resume with PDF-only export. Canva's resume templates are free to
export but most are 2-column, which breaks ATS parsing (Workday, Taleo,
SuccessFactors — common in Pakistani banks/telcos). None of the big three
have Pakistan/Gulf-specific fields (WhatsApp number, nationality, visa
status, Gulf-style photo CV).

**The gap:** a genuinely free, unlimited, ATS-safe builder with local
context built in, and no "pay to download the real file" trick.

## MVP scope (what's built)

- Landing page (`index.html`) — SEO-targeted, comparison table, FAQ.
- Builder app (`builder.html` + `script.js`) — form on the left, live A4
  preview on the right.
- 4 templates: Classic (ATS-safe single column), Modern (sidebar), Minimal,
  Gulf CV (banner + photo + nationality/visa fields).
- Sections: personal info, summary, work experience (repeatable), education
  (repeatable), skills, languages, certifications (repeatable), references
  toggle, optional photo upload.
- PDF export via the browser's native print dialog (`window.print()` +
  print stylesheet) — no library, no server, no cost, no limit.
- Autosave to `localStorage` (no login, no backend). Export/Import JSON
  buttons act as a manual backup/transfer mechanism between devices.

## Deliberately NOT in the MVP

- No accounts, no database, no payment integration.
- No AI content generation (keeps it a static site — zero running cost).
- No analytics yet (add Plausible/GA4 once you have a domain, or skip for
  privacy positioning).
- No premium tier yet — ship free-only first, see if it gets traction via
  SEO/Reddit, then decide whether ads or a paid tier (extra templates /
  cover letter) makes sense.

## Deploy (free, ~2 minutes)

**Vercel:**
1. Push this folder to a GitHub repo.
2. vercel.com → New Project → import the repo → Framework preset: "Other" →
   Deploy. (`vercel.json` is already set up; no build command needed.)

**Netlify:**
1. netlify.com → "Add new site" → "Deploy manually" → drag this folder in.
   Or connect the GitHub repo with build command empty and publish
   directory `/`.

Before going live: replace `REPLACE-WITH-YOUR-DOMAIN` in `robots.txt` and
`sitemap.xml` with your actual domain once you have one (a free
`*.vercel.app` or `*.netlify.app` subdomain works for launch).

## Customer acquisition plan (zero budget)

1. **SEO** — landing page already targets "free resume builder Pakistan",
   "ATS CV Pakistan", "Gulf CV template". Add 3-5 short blog-style pages
   later (e.g. "How to write a CV for Gulf jobs from Pakistan") once the
   core tool is live — each one links back to the builder.
2. **Reddit** — r/pakistan, r/islamabad, r/Lahore, r/PakistaniStudents,
   r/jobs (careful with self-promo rules — answer real "how do I format my
   CV" questions and mention the tool where genuinely relevant, don't spam
   every thread).
3. **Facebook groups** — Pakistani job-seeker and "jobs in Pakistan"
   groups are very active; same rule, be useful first.
4. **University career-society pages / WhatsApp groups** — fresh
   graduates are the core audience and this is where they already are.

## Next steps once scope is confirmed

- Pick and buy/connect a domain (or launch on the free subdomain first —
  free is fine to validate).
- Deploy to Vercel or Netlify.
- Soft-launch in 1-2 relevant subreddits/groups, watch for real usage and
  feedback before building anything further (e.g. cover letter builder,
  more templates, AI bullet-point rewriting).
