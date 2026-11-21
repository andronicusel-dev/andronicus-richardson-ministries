# Install the gallery and picture update (Windows)

This update adds a public **Gallery**, a staff-only gallery manager, a temporary green emblem and new illustrative images. It does **not** replace your live database, staff account, prayer requests, messages or site settings. Existing installations create the gallery table automatically the first time signed-in staff open the Gallery editor.

## 1. Download and extract the update

1. In the Arena website preview (not the public Vercel website), scroll to the bottom and click **Download website update**. The file is called `andronicus-gallery-update.zip`.
2. Find it in Windows **Downloads**. Right-click it and choose **Extract All**.
3. Extract it into your existing `Desktop\andronicus-richardson-ministries` folder. If Windows asks whether to replace files, choose **Replace**. The archive contains no `.env` file or database credentials and does not remove your `.git` folder.
4. Open that folder and confirm that `src`, `public\images`, `package.json` and `package-lock.json` are beside one another—not inside an extra nested folder.

## 2. Upload the update to GitHub

Open the same PowerShell window you used earlier. Run each line separately:

```powershell
cd "$env:USERPROFILE\Desktop\andronicus-richardson-ministries"
git add src public/images package.json package-lock.json database-setup.sql DEPLOYMENT.md UPDATE-WEBSITE.md .gitignore
git commit -m "Add ministry gallery and images"
git push
```

Use GitHub browser sign-in if prompted. Never paste a password, token or database URL into a command or chat. If a command reports an error, stop and read it before continuing; do not force-push or delete the Git folder.

## 3. Wait for Vercel and add your real images

1. Vercel starts a deployment after the GitHub push. In your Vercel project, open **Deployments** and wait for the new one to say **Ready**.
2. Sign in at `https://andronicus-richardson-ministries.vercel.app/admin`.
3. Under **Pictures & logo**, upload your original green logo to **Ministry logo** and the portrait to **About page picture**. You can also replace the other pictures. The default emblem is a temporary illustration because the originals provided in chat were not accessible as files to the project. The site title remains Andronicus Richardson Ministries; the supplied green artwork itself contains “EL”.
4. Under **Gallery**, choose up to 12 photos, optionally enter a program name, date and caption, and click **Add to gallery**. You can edit captions, replace photos or delete them later. Gallery images are public; get permission from the people shown, especially children.

Images are resized and stored in the website database, so they remain through redeployments. There is no need to rerun the Neon SQL setup unless the database user lacks permission to create the gallery table.

The starter service times, sermons and events are made-up examples. Replace or remove them before sharing the site widely.
