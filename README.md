# Anjali Keshri: 3D Portfolio
Run: `npm install` then `npm run dev`. Build: `npm run build` (output in dist/, deploy to Vercel or Netlify).

- All copy: src/content/profile.ts and src/content/data.ts
- Photos: public/assets/ (self-portrait.jpg, avatar.webp, illustration.jpg). Keep filenames when replacing.
- Live coding stats: push this repo to GitHub. The workflow in .github/workflows writes public/stats.json every 6 hours; the site reads it and falls back to public APIs, then to résumé numbers.
- Intro figure: `character` in profile.ts ("robot", "avatar" or "procedural").
