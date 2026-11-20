# Andronicus Richardson Ministries — website guide

## Current website

- Public site: https://andronicus-richardson-ministries.vercel.app
- Staff sign-in: https://andronicus-richardson-ministries.vercel.app/admin
- Website code: https://github.com/andronicusel-dev/andronicus-richardson-ministries

The production site is hosted on Vercel and stores its data in Neon PostgreSQL. Keep the Neon connection string, account passwords and access tokens private; never commit them to GitHub or share them in chat.

## Updating day to day

Sign in using the staff link. You can edit service times, sermons, events, contact details, the welcome message and giving links from the admin tabs. Prayer requests and contact messages arrive in the admin inbox; **email alerts are not configured**, so check the inbox regularly.

After installing the pictures-and-logo update, the **Pictures & logo** tab lets staff upload JPG, PNG or WebP files and restore the originals. Uploaded pictures are stored in the database so they persist through Vercel redeployments. The logo appears in the website header and footer; the browser-tab icon remains the original mark. For how to install the update on Windows, see `UPDATE-WEBSITE.md`.

The starter service times, sermons and events are made-up examples. Replace or remove them before promoting the site. The original photographs are AI-generated examples, not photographs of the church. Online giving appears only after adding a real giving link under **Site details → Giving**.

## Publishing code changes

The GitHub `main` branch is connected to Vercel. Pushing a commit to `main` triggers a new production deployment. Wait for **Ready** under the Vercel project's **Deployments** tab, then check the public site.

Back up custom code before overwriting it. Never add `.env`, `.env.local`, database credentials, passwords, or access tokens to Git. The `.gitignore` file excludes the usual local environment files, but always review changes before committing.

## New installation or disaster recovery

1. Create a PostgreSQL database and run `database-setup.sql` in Neon **Postgres database → SQL Editor**. Existing installations need not rerun it for the image editor: the editor creates its image table when an authenticated staff member opens it, assuming the database user has table-creation permission.
2. In Vercel, import the repository and set the server-side environment variable `DATABASE_URL` to the full **pooled** Neon connection string. Keep that string secret. Choose a branch and database that match the ones where you ran the setup.
3. Deploy, then immediately open `/admin/setup` and create the staff account before sharing the URL. The first person to **create** the account becomes the administrator.
4. Add real church details and remove the starter examples.

Vercel Hobby and Neon free plans have eligibility rules and usage limits. A custom domain is optional and is usually paid separately. Check the providers' current plans and terms before relying on a free tier.
