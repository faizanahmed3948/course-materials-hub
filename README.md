# Course Materials Hub

A free Progressive Web App giving Computer Engineering students at the University of Sharjah centralized access to course materials, hosted via Google Drive.

**Live app:** https://tutorpage.netlify.app/

## Features
- **Course Drive** — 44 courses across categories (Core, Advanced, Lab, Math, General), with search and filtering
- **Eng. Ahmed Videos** — video lecture library
- **Community Wall** — student discussion space
- **Private Tutoring** — booking section for 1:1 sessions
- **My Study Plan** — personal study planner

## Tech
- Installable PWA (`manifest.json`)
- Custom service worker (`sw.js`) with a mixed caching strategy:
  - HTML/navigation requests: network-first (always serves the latest content)
  - Same-origin assets: cache-first (fast repeat loads)
  - Third-party assets: stale-while-revalidate
- Hosted on Netlify

## Files
- `course-hub.html` — main application
- `index.html` — redirects to `course-hub.html`
- `manifest.json` — PWA manifest
- `sw.js` — service worker
