# Massoda — Portfolio

Personal portfolio site for **Emilien Massoda** — Frontend Developer & Designer. The repo contains two linked but distinct sites: a professional/dev portfolio and a separate creative portfolio, plus a technical blog on each.

**Live:** [massoda.me](https://massoda.me) &nbsp;·&nbsp; **Creative:** [massoda.me/creative-portfolio](https://massoda.me/creative-portfolio/index.html)

---

## What's in here

### Dev Portfolio (`/`)
Case studies, services, and a technical blog aimed at freelance/contract work and full-time roles.

- **10 real case studies** — from a full-stack fintech wallet platform (Mobi-Kumbu) to a multi-vendor WooCommerce marketplace (FreshBox Tech), a machine learning project (Eth AI Forecaster), and more. No placeholder/filler projects.
- **7 service pages** covering UI/UX design, interaction design, frontend engineering, mobile & web app development, machine learning, and data analytics.
- **10-post blog** covering current cloud, AWS, DevOps, and AI-infrastructure trends.
- Working contact form (FormSubmit-powered) plus a Calendly booking link.

### Creative Portfolio (`/creative-portfolio`)
A separate visual-arts and animation portfolio under the **Fauxverse** name — illustration, logo animation, and motion design work.

- Hero slider, scroll-driven interaction design, and a dedicated Process/Sketchbook section with real Procreate timelapses.
- **6 creative service pages**, each with a working contact form and Calendly link.
- **2 logo animation detail pages** (Fuse, Bpétale) — main gallery shows only the looping animation; each detail page shows the full process timelapse.
- **3-post blog** on illustration/animation topics.
- Subtle, site-wide newsletter signup in the footer.

---

## Tech stack

No framework, no build step — plain HTML, CSS, and vanilla JavaScript throughout.

| | |
|---|---|
| **Structure** | Static HTML, one file per page |
| **Styling** | Hand-written CSS (`main.css` for the dev site, `creative.css` for the creative site) — CSS custom properties for theming, no preprocessor |
| **Interactivity** | Vanilla JS (`main.js` / `creative.js`) — scroll reveals, page transitions, cursor-preview hover images, lazy-loaded video, mobile menu, form handling |
| **Fonts** | Google Fonts (Bebas Neue) + Fontshare (Satoshi) |
| **Forms** | [FormSubmit](https://formsubmit.co) — no backend required |
| **Hosting** | GitHub Pages, custom domain |

---

## Folder structure

```
.
├── index.html                  # Dev portfolio homepage
├── 404.html
├── sitemap.xml
├── robots.txt
├── llms.txt                    # AI-crawler-readable site summary
├── assets/
│   ├── css/main.css
│   └── js/main.js
├── media/                      # Dev portfolio images, favicons, OG images
├── portfolio/                  # 10 case study pages + index
├── services/                   # 7 dev service pages
├── blog/                       # 10 dev blog posts + index
└── creative-portfolio/
    ├── index.html
    ├── blog.html + blog-*.html # 3 posts
    ├── creative.css
    ├── creative.js
    ├── media/                  # Illustrations, video, gallery assets
    │   └── video/              # Compressed mp4/webm timelapses & loops
    ├── *-logo-animation.html   # Logo animation detail pages
    └── [service-name].html     # 6 creative service pages
```

---

## Running locally

No build tools, no dependencies to install. Any static file server works:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

---

## SEO & discoverability

- `sitemap.xml` and `robots.txt` at the root
- `llms.txt` — a plain-text summary of the site aimed at AI crawlers/agents, separate from what search engines index
- `Person`, `WebSite`, `FAQPage`, and `CreativeWork`/`BlogPosting` JSON-LD structured data across relevant pages
- Open Graph + Twitter Card meta tags on every page
- Canonical URLs on every page

---

## Deployment

Hosted on GitHub Pages with a custom domain (`massoda.me`) via a `CNAME` file at the repo root. Pushing to the default branch deploys automatically — there's no build step to run first.

---

## Contact

- [Schedule a call](https://calendly.com/emilienmassoda/30-minutes-with-massoda)
- [LinkedIn](https://www.linkedin.com/in/jean-emilien-l-59b7061a9)
- [GitHub](https://github.com/J-Massoda)

---

## License

All code in this repository is © Emilien Massoda. Site content, illustrations, and case study material are not licensed for reuse.
