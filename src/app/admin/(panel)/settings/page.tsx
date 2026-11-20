import { changePassword, saveSettings } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin-client";
import { AField, AdminCard, AdminTitle } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const settings = await getSettings();

  return (
    <>
      <AdminTitle title="Site details">
        The wording, contact details and links shown across your website. Anything you leave empty is simply left off
        the site.
      </AdminTitle>

      <ActionForm action={saveSettings} submitLabel="Save site details">
        <div className="space-y-6">
          <AdminCard title="Home page">
            <div className="space-y-4">
              <AField
                label="Tagline"
                name="tagline"
                required
                maxLength={200}
                defaultValue={settings.tagline}
                hint="The sentence under your ministry's name at the top of the home page."
              />
              <AField label="Welcome heading" name="welcomeHeading" required maxLength={120} defaultValue={settings.welcomeHeading} />
              <AField
                label="Welcome message"
                name="welcomeBody"
                rows={5}
                defaultValue={settings.welcomeBody}
                hint="Leave an empty line between paragraphs."
              />
            </div>
          </AdminCard>

          <AdminCard title="About page">
            <div className="space-y-4">
              <AField
                label="About the ministry"
                name="aboutBody"
                rows={9}
                defaultValue={settings.aboutBody}
                hint="Your story, what you believe, what a visitor can expect. The first paragraph is shown larger."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AField label="Pastor or leader's name" name="leaderName" maxLength={120} defaultValue={settings.leaderName} />
                <AField
                  label="Their title"
                  name="leaderTitle"
                  maxLength={120}
                  placeholder="Senior Pastor"
                  defaultValue={settings.leaderTitle}
                />
              </div>
              <AField
                label="About the pastor or leader"
                name="leaderBio"
                rows={5}
                defaultValue={settings.leaderBio}
                hint="This section only appears on the About page once a name is filled in."
              />
            </div>
          </AdminCard>

          <AdminCard title="Location and contact" id="contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <AField label="Street address" name="address" maxLength={200} autoComplete="off" defaultValue={settings.address} />
              <AField label="City, state and ZIP" name="cityStateZip" maxLength={200} autoComplete="off" defaultValue={settings.cityStateZip} />
              <AField label="Phone" name="phone" type="tel" maxLength={40} autoComplete="off" defaultValue={settings.phone} />
              <AField label="Second phone" name="phone2" type="tel" maxLength={40} autoComplete="off" defaultValue={settings.phone2} />
              <AField label="Contact email" name="email" type="email" maxLength={200} autoComplete="off" defaultValue={settings.email} />
            </div>
          </AdminCard>

          <AdminCard title="Giving" id="giving">
            <div className="space-y-4">
              <AField
                label="Online giving link"
                name="givingUrl"
                placeholder="cash.app/$yourname, paypal.me/yourname, tithe.ly/…"
                defaultValue={settings.givingUrl}
                hint="Paste the link to your Cash App, PayPal, Givelify, Tithe.ly or other giving page. A “Give online” button will appear on your Give page."
              />
              <AField
                label="Other ways to give"
                name="givingNote"
                rows={3}
                defaultValue={settings.givingNote}
                hint="For example, where to mail a check or who to make it out to."
              />
            </div>
          </AdminCard>

          <AdminCard title="Social media">
            <div className="grid gap-4 sm:grid-cols-3">
              <AField label="Facebook" name="facebookUrl" placeholder="facebook.com/…" defaultValue={settings.facebookUrl} />
              <AField label="YouTube" name="youtubeUrl" placeholder="youtube.com/@…" defaultValue={settings.youtubeUrl} />
              <AField label="Instagram" name="instagramUrl" placeholder="instagram.com/…" defaultValue={settings.instagramUrl} />
            </div>
          </AdminCard>
        </div>
      </ActionForm>

      <AdminCard title="Change your password" className="mt-12">
        <p className="-mt-3 mb-5 text-ink-soft">Signed in as {admin.email}.</p>
        <ActionForm action={changePassword} submitLabel="Change password" pendingLabel="Changing…" resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-3">
            <AField label="Current password" name="current" type="password" required autoComplete="current-password" />
            <AField label="New password" name="next" type="password" required autoComplete="new-password" hint="At least 10 characters." />
            <AField label="New password again" name="confirm" type="password" required autoComplete="new-password" />
          </div>
        </ActionForm>
      </AdminCard>
    </>
  );
}
