# Cell Architecture Studio

Interactive premium prototype for exploring white blood cell architecture with layered depth, motion, and organelle context.

## Requirements

- Node.js 20+
- npm 10+

## Local setup

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the project into Vercel.
3. Keep the default framework preset or set it to **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`

A `vercel.json` file is included with the same settings for consistent deployments.

## Notes

- Remote image layers include graceful fallbacks for network failures.
- Tablet and desktop breakpoints are tuned to preserve the current visual identity while maintaining usability.
