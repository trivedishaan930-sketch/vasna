# VELORA — Romance, Travel & Lifestyle

A no-cost, static-first Progressive Web App MVP for adults who want to plan meaningful romantic experiences, discover destinations, get practical style guidance, prepare travel essentials, and read uplifting romance stories.

## Current MVP

- Responsive editorial-style homepage and mobile navigation
- 18+ acknowledgement gate (not identity verification)
- Destination discovery with curated inspiration cards
- Browser-only romantic trip planner with locally generated sample itineraries
- Outfit guidance based on occasion and climate
- Travel and personal-care checklist saved in the browser
- Short original romance stories
- Demo concierge with curated, rule-based replies (not a live AI model)
- Installable PWA shell and a small offline fallback

## Cost and functionality notes

This version uses plain HTML, CSS, and JavaScript. It does not require a build step, paid API, database, authentication provider, payment processor, or server. User preferences, saved plans, and checklist state stay in the user's browser via localStorage.

Destination cards and sample itineraries are editorial inspiration only. Live weather, visa checks, hotel inventory, booking availability, prices, shopping checkout, medical advice, real AI generation, user accounts, and person-to-person matching are not connected in this MVP. Those features need reliable providers, policy review, and safety workflows before launch.

## Run locally

Open `index.html` in a browser. For PWA/service-worker testing, serve the folder over localhost, for example:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy free

The project is static and can be deployed on a free static-hosting tier such as Cloudflare Pages or GitHub Pages. No custom domain is required. Hosting provider limits and free-tier terms can change.

## Images

Editorial photography is loaded from Unsplash image CDN URLs. Image authorship and source pages are linked in the site footer and image credits. Replace or self-host images before commercial scale if you need guaranteed asset control.

## Safety principles

- Adults-only product positioning; no explicit sexual content
- Respectful, consensual relationship guidance
- No medical or stamina claims; medicines must be handled through licensed providers
- No dating/matchmaking or paid companionship in this first release
- No fake reviews, live prices, availability, or provider endorsements
