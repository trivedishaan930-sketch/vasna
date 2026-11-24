# VELORA — Romance · Travel · Lifestyle

VELORA is a premium, adults-only romance, travel and lifestyle experience built as a static website and installable Progressive Web App. The product is designed around meaningful travel, thoughtful couple and solo experiences, personal style, everyday essentials, original stories and wellbeing.

## Latest homepage art direction

The homepage uses one full-width sunlit couple campaign image with the owner's identity represented within the couple, not a standalone profile portrait. The hero, trip finder, four trust points and six image-led experience cards are designed as one continuous editorial landing section, with a separate mobile composition.

## Design direction

- Midnight navy, champagne gold, warm ivory and restrained rose accents
- Editorial serif headlines paired with a clean sans-serif interface
- Destination photography and the owner-provided VELORA couple reference visual
- Responsive layouts for desktop, tablet and mobile

## Included product areas

- Explore: destination discovery with filters and destination-guide modals
- Travel Planner: day-by-day sample itineraries, travel mood, party type and budget-style preferences
- Experiences: solo, couple and everyday experience ideas
- Style Studio: clothing guidance for men, women, couples and unisex preferences based on occasion and weather
- Lifestyle Essentials: travel, grooming, gifting and sexual-health essentials categories; add items to a local saved list
- Wellbeing: consent, sexual-health basics, travel safety and personal wellbeing information
- Journal: original short fiction and reflective stories
- Creative Storyboard Studio: scene-by-scene cinematic photo/video prompts for 15, 25 and 35-second stories
- VELORA Concierge: curated, rule-based browser demo for destinations, style, packing and wellbeing questions
- Profile and saved ideas: browser-local preferences and saved collection
- PWA: installable shell and basic offline caching

## No-cost technology

This release is plain HTML, CSS and JavaScript. It has no build step, paid API, database, authentication provider or payment gateway. Browser preferences and saved items are stored on the user's device using localStorage. The website can be hosted free on GitHub Pages while the repository remains public. Official documentation confirms that GitHub Pages is available for public repositories on GitHub Free and explains the GitHub Actions publishing flow:

- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Enable free GitHub Pages deployment

1. Open the repository Settings.
2. Open Pages in the sidebar.
3. Under Build and deployment → Source, choose GitHub Actions.
4. The workflow at .github/workflows/deploy.yml deploys the static site from main.
5. Open the Actions tab and check the latest Deploy VELORA to GitHub Pages run. Once it succeeds, the Pages URL is shown in the deployment environment.

No custom domain is required. The repository must remain public for GitHub Free Pages. A custom domain is optional and not needed for the first public website.

## Connected services that are not falsely represented as live

This no-cost static release does not currently connect to:
- Live weather feeds, climate forecasts or travel advisories
- Visa and entry-rule databases
- Hotel, flight, activity or restaurant booking inventory
- Live prices, availability, product merchant checkout or affiliate feeds
- A hosted AI model or server-side chatbot
- Secure user accounts, identity verification, community messaging or real-person matching
- Medical services, prescriptions or supplement recommendations

Those services need reliable provider agreements, API credentials, server-side secrets, privacy review and safety operations. The current planner and Concierge clearly use sample and curated browser logic rather than claiming to be real-time or AI-connected.

## Responsible product principles

- Intended for adults 18+; the website gate is an acknowledgement only, not identity verification.
- Non-explicit, respectful relationship and lifestyle content.
- Consent, user safety, privacy and accessible design are core principles.
- No pornography, sexual services, unverified stamina products, medicine claims or unsafe supplement recommendations.
- Sexual-health information is general education; users should consult licensed clinicians or pharmacists for personal medical concerns.
- Destination and outfit ideas are inspiration; users must verify current local laws, weather, entry requirements and venue rules.

## Run locally

Open index.html in a browser for basic use. For service-worker and PWA testing, serve the folder over localhost with a local static server such as Python's built-in http.server.

## Images

The hero and studio reference use a couple photo supplied by the project owner and included under assets/. Other editorial photographs are served from Unsplash image URLs as visual inspiration. Before commercial scaling, maintain an asset register and confirm the current licence and attribution requirements for every image; replace external image dependencies with properly licensed or self-hosted assets.
