# Yug Jha — VSL Editor & Motion Graphics Portfolio

React 19 + TanStack Start + Vite + Tailwind v4 single-page portfolio site.

## Run locally

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # production build
```

## EmailJS setup (contact form → yjha019@gmail.com)

The contact form sends the brief with [EmailJS](https://www.emailjs.com) straight
from the browser — no backend needed.

**1. Create the service**

1. Sign up at https://dashboard.emailjs.com
2. **Email Services → Add New Service → Gmail**, connect `yjha019@gmail.com`,
   and copy the **Service ID** (`service_xxxxxxx`).

**2. Create the template**

**Email Templates → Create New Template**. Set:

- **To Email:** `yjha019@gmail.com`
- **From Name:** `{{name}}`
- **Reply To:** `{{email}}`
- **Subject:** `New project brief — {{name}} ({{videoType}})`

Content (copy-paste):

```
Name: {{name}}
Company: {{company}}
Email: {{email}}
Phone: {{phone}}

Deadline: {{deadline}}
Video type: {{videoType}}
Reference: {{reference}}

Description:
{{description}}
```

Save and copy the **Template ID** (`template_xxxxxxx`).

**3. Get the public key**

**Account → General → Public Key** (`xxxxxxxxxxxxxxxx`).

**4. Add the environment variables**

Create a `.env` file in the project root (see `.env.example`):

```bash
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

Restart the dev server. Submitting the form now delivers to `yjha019@gmail.com`.

> These `VITE_` values are public by design (EmailJS public keys are safe in the
> browser). Lock the domain in **EmailJS → Account → Security → Allowed origins**.

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

1. **Add New → Project** → import the GitHub repo.
2. Leave the build settings as-is — `vercel.json` already sets
   `NITRO_PRESET=vercel npm run build`, which emits the Vercel Build Output API
   bundle automatically.
3. Add the three `VITE_EMAILJS_*` variables under
   **Settings → Environment Variables** (Production + Preview).
4. Deploy.
