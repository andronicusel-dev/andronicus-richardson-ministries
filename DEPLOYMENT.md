# Putting Andronicus Richardson Ministries online (for real)

The site you see in the workspace is a preview. This guide gets it onto a permanent
address that anyone can open in a browser. All of the services below have a free
tier; the only ongoing cost is the custom domain name (roughly $10–25 / year).

You will need a computer for steps 1–2. Steps 3 onward are all clicking in the
browser.

---

## 1. Put the website code on GitHub

GitHub stores the code and Vercel reads it from there.

1. Make a free account at **github.com**.
2. On github.com click **New repository**, name it `andronicus-richardson-ministries`
   (public or private both work), and create it.
3. On your computer, in the folder containing this project, open a terminal and run:

   ```bash
   git init
   git add .
   git commit -m "Andronicus Richardson Ministries website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/andronicus-richardson-ministries.git
   git push -u origin main
   ```

   (Ask the person who has this folder for a copy of it if it is not already on
   your computer — every file in the project folder, including this one.)

## 2. Create the database

The website stores service times, sermons, events, prayer requests and messages in
a PostgreSQL database.

1. Make a free account at **neon.tech** (a "Postgres on the web" service).
2. Create a new project (the default settings are fine).
3. Copy the **connection string** (it looks like
   `postgresql://user:password@host/dbname?sslmode=require`) and save it
   somewhere safe. You will paste it into Vercel in step 4.
4. In Neon, open the **PSQL** console tab and paste in the entire contents of
   **`database-setup.sql`** (next to this file), then run it. This creates all the
   tables the website needs. Do this once.

## 3. Deploy the website on Vercel

1. Make a free account at **vercel.com** (you can sign in with GitHub).
2. Click **Add New → Project**, choose the repository from step 1, and press
   **Import**. Vercel recognises the Next.js project by itself.
3. On the deploy screen, in **Environment Variables**, add one variable:
   - Name: `DATABASE_URL`
   - Value: the connection string you copied from Neon in step 2.
4. Press **Deploy**. Wait a minute or two. Vercel gives you an address like
   `your-project.vercel.app` — open it and your website is live on the internet.

## 4. Create your admin sign-in on the new site

The new database is empty, so this is a fresh start:

1. Open `your-address/admin` (or click "Staff sign-in" at the bottom of the page).
2. Choose your email and password. **Do this first** — it only happens once, and
   whoever opens that page first becomes the administrator.
3. Fill in your real details: service times, address, phone numbers, email, the
   online giving link, and your own wording. Remove the starter examples with the
   button on the Overview page when you have replaced them.

That's it — members of the church now have a real address to bookmark, and every
prayer request or message they send lands in the admin inbox.

## 5. Get your own domain name (recommended)

1. Buy a domain such as `andronicusrichardsonministries.com` or a `.co.za`
   address (registrar suggestions: Namecheap, Cloudflare, Dynadot, or any
   .co.za registrar).
2. In Vercel: **Project → Settings → Domains → Add**, type your domain.
3. Vercel shows you two DNS instructions (for example, an A record and a CNAME).
   Enter those at your domain registrar. Within a few minutes (sometimes a few
   hours) the site is served from your own address. HTTPS is automatic.

## Keeping it up to date

- **Day-to-day changes** (sermons, events, service times, wording, prayer
  requests): just use the admin area at `your-address/admin`. No technical steps.
- **Code changes**: make the change, then on your computer run
  `git add . && git commit -m "what changed" && git push`. Vercel rebuilds and
  publishes the new version automatically within a minute or two.

## Handy links after you have deployed

| What | Where |
| --- | --- |
| Website | `your-project.vercel.app` (or your domain) |
| Admin area | `your-project.vercel.app/admin` |
| Prayer requests & messages | admin → "Prayer requests" / "Messages" |
| Deploy status | vercel.com → your project |
| Database | neon.tech → your project |
