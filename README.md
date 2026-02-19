# Custom Contracting Inc — Financial Command Center

A Next.js web app for tracking break-even, scenarios, budget, and service line profitability.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Next.js — click **Deploy**
4. Done! Your dashboard is live at `https://your-project.vercel.app`

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How Data is Saved

- **💾 Save** — saves to your browser's localStorage (survives page reloads on the same device/browser)
- **📤 Export** — downloads a JSON backup file you can store anywhere
- **📥 Import** — restores from any previously exported JSON file

> **Note:** localStorage is per-browser. If you open the app on a different computer, use Export + Import to move your data.