# AgriBridge React Frontend

Responsive React + Bootstrap frontend matching the AgriBridge website/dashboard structure.

## Fixed startup issue

The original package contained literal escaped quotes (`\\"`) inside several JSX array literals in the dashboard files. Those characters make the JSX invalid and cause the app to fail before rendering. They have been removed.

Bootstrap's JavaScript bundle is also imported in `src/main.jsx`, so the mobile navbar collapse works.

## Run

Requires Node.js 20.19+ or Node.js 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Pages

Public:
- `/`
- `/about`
- `/features`
- `/marketplace`
- `/land-leasing`
- `/contact`
- `/auth`

Dashboards:
- `/farmer`
- `/buyer`
- `/landowner`
- `/admin`

All data is mock frontend data and can be connected to an API/backend later.
