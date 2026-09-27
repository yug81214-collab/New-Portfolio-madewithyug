# Yug Jha — VSL Editor & Motion Graphics Portfolio

React 19 + TanStack Start + Vite + Tailwind v4 single-page portfolio site.

## Run locally

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # production build
```

## EmailJS setup (contact form → email)

The contact form submits through a TanStack Start server function. Configure these values in Vercel under **Settings → Environment Variables** for both Production and Preview:

```bash
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=your_private_key_if_used
```

Keep private credentials unprefixed. `VITE_` variables are exposed to browser code.

## Deploy to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Keep the framework preset as **TanStack Start**. Do not set a custom output directory; Nitro generates Vercel's Build Output API output.
3. Use Node.js **24.x** (pinned in `package.json`).
4. Add the required Supabase and EmailJS environment variables to the relevant Vercel environments.
5. Redeploy after changing environment variables.

The repository's `vite.config.ts` automatically selects Nitro's `vercel` preset during Vercel builds.
