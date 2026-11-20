# Install the pictures and logo update (Windows)

This update adds the missing example photos and a **Pictures & logo** tab to the staff area. It does **not** replace your live database, staff account, prayer requests, messages, or site settings. Existing installations create the new picture table automatically the first time a signed-in staff member opens the new editor.

## 1. Download and extract the update

1. In the Arena website preview (not the public Vercel website), scroll to the bottom and click **Download website update**. The file is called `andronicus-update-photos-logo.zip`.
2. Find it in Windows **Downloads**. Right-click it and choose **Extract All**.
3. Extract it to the existing folder `Desktop\andronicus-richardson-ministries`. If Windows asks whether to replace files, choose **Replace**. The archive contains no `.env` file or database credentials and will not remove your `.git` folder.
4. Open the folder and make sure you see `src`, `public\images`, `package.json` and `package-lock.json` side by side.

## 2. Upload the changes to GitHub

Open the same PowerShell window you used earlier. Run each line separately:

```powershell
cd "$env:USERPROFILE\Desktop\andronicus-richardson-ministries"
git add src public/images package.json package-lock.json database-setup.sql DEPLOYMENT.md UPDATE-WEBSITE.md .gitignore
git commit -m "Add pictures and logo editor"
git push
```

Use GitHub browser sign-in if prompted. Never paste a password, token, or database URL into a command or a chat. If a command reports an error, stop and read it before continuing; do not force-push or delete the Git folder.

## 3. Wait for Vercel and change a picture

1. Vercel will start a new deployment automatically after the GitHub push. In your Vercel project open **Deployments** and wait for the new one to say **Ready**.
2. Open `https://andronicus-richardson-ministries.vercel.app/admin` and sign in.
3. Choose **Pictures & logo**, then **Choose File**, choose a JPG, PNG or WebP, and click **Save picture** or **Save logo**. The image is stored in your database and appears on the site. The logo is used in the header and footer; the browser-tab icon remains the original mark.
4. Use **Restore original** to return to an example photo, or **Remove custom logo** to return to the original mark.

The pictures included in this update are AI-generated examples, not photographs of the church. Please replace the example service times, sermons and events with the ministry's real information before sharing the site widely.
