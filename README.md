# Ethostrategy — Website

Founder-led consulting. Strategy built on ethics. Impact built to last.

## Stack

- Pure HTML / CSS / JS — no build step, no frameworks
- Satoshi from Fontshare CDN
- Canvas-based animations for nav logo, hero arctic globe, and star field
- Netlify for hosting + forms

## Structure

```
/
├── index.html              # Home
├── our-work/index.html     # Framework + founder bio + case studies
├── insights/index.html     # Blog listing
├── contact/index.html      # Contact + Netlify form
├── pricing/index.html      # Etho101 / Etho180 / Etho360
├── assets/
│   ├── css/style.css       # All global styles
│   └── js/main.js          # Nav scroll, star field, nav logo, arctic globe
├── netlify.toml            # Deploy + headers + redirects
└── README.md
```

## Local preview

No build step — just open `index.html` in a browser, or serve with any static server:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

The site is configured for Netlify. Push to GitHub and connect the repo in Netlify — no build command needed.

```bash
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/ethostrategy/ethostrategy-site.git
git push -u origin main
```

Then in Netlify: **New site from Git** → pick the repo → leave build command blank, publish directory `.` → Deploy.

## Contact

ethostrategy@gmail.com
