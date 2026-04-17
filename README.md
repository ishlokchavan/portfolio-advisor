# Portfolio Advisor

Mobile-first PWA for Dubai off-plan property investors. Track units, payment schedules, ownership shares, and future cashflow.

Next.js 14 · TypeScript · TailwindCSS · Supabase · Recharts · next-pwa

---

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

1. Your `.env.local` is already populated with your project URL and anon key.
2. In Supabase SQL Editor, paste and run the contents of `schema.sql` (creates tables, indexes, RLS policies, and the creator-as-owner trigger).
3. In Supabase → Authentication → Providers:
   - Enable **Email** (magic link). Under Email settings, you can disable "Confirm email" for instant login.
   - Enable **Google**: create OAuth credentials in Google Cloud Console, paste Supabase's callback URL into Google, paste Client ID + Secret back into Supabase.
4. In Supabase → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (for dev) then your Vercel URL in production.
   - Redirect URLs: add both `http://localhost:3000/auth/callback` and `https://YOUR-VERCEL-DOMAIN/auth/callback`.

## 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000. PWA features are disabled in dev; test them with `npm run build && npm start` or on Vercel.

---

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Portfolio Advisor PWA"
git branch -M main
git remote add origin https://github.com/ishlokchavan/portfolio-advisor.git
git push -u origin main
```

If the remote is new, GitHub will prompt for auth. Use `gh auth login` (GitHub CLI) or a freshly generated PAT you don't paste into chat.

## Deploy to Vercel

1. vercel.com → Add New → Project → import `ishlokchavan/portfolio-advisor`.
2. Framework: Next.js (auto).
3. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
5. Once live, copy the Vercel domain back into Supabase → Authentication → URL Configuration (both Site URL and as an additional `/auth/callback` redirect).

---

## Features

- Google + magic-link auth (no passwords)
- Dashboard: portfolio value, upcoming payments, next 6/12 months totals, cashflow bar chart
- Properties: card list, create with payment-plan template auto-generation (80/20, 70/30, 60/40, Post Handover), per-property detail with editable payment schedule
- Cashflow: aggregated monthly chart + breakdown, paid / upcoming / overdue color coding
- CSV export of properties and payment schedules
- Mobile bottom tab nav, desktop sidebar
- Full PWA: manifest, service worker (next-pwa), maskable icons, install prompt, Apple meta tags

## File Structure

```
app/              — routes (login, auth/callback, dashboard, properties, cashflow, account)
components/       — Shell, Sidebar, MobileTabNav, Navbar, PropertyCard,
                    PaymentTable, CashflowChart, InstallPrompt, EmptyState, LoadingSpinner
lib/              — supabase clients, currency helpers, CSV, payment templates
types/            — shared TypeScript types
public/           — manifest.json + icons (service worker generated on build)
middleware.ts     — auth-gated routing
schema.sql        — database schema + RLS policies
```

## Security notes

- Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` is used client-side. Never commit or expose the `service_role` key.
- RLS is enforced at the database; policies restrict reads/writes to rows where the user is an owner.
- Only the property creator can manage owners.
