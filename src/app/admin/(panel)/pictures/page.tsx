import { AdminTitle } from "@/components/admin-ui";
import { ImageEditor } from "@/components/image-editor";
import { requireAdmin } from "@/lib/auth";
import { defaultImageManifest, IMAGE_SLOT_ORDER } from "@/lib/image-slots";
import { ensureSiteImagesTable, getSiteImages } from "@/lib/site-images";

export const dynamic = "force-dynamic";

export default async function AdminPicturesPage() {
  await requireAdmin();
  let ready = true;
  try {
    await ensureSiteImagesTable();
  } catch {
    ready = false;
  }
  const images = ready ? await getSiteImages() : defaultImageManifest();

  return (
    <>
      <AdminTitle title="Pictures & logo">
        Make the website your own. Choose a picture, preview it, and save. Your changes appear on the public site.
      </AdminTitle>

      <div className="mb-7 rounded-md border border-rule bg-white px-5 py-4 text-ink-soft">
        Your pictures are stored with your website&apos;s database, so they stay in place when the site is updated. The
        original pictures are examples, not photographs of your church.
      </div>

      {ready ? (
        <div className="space-y-5">
          {IMAGE_SLOT_ORDER.map((slot) => <ImageEditor key={slot} slot={slot} initial={images[slot]} />)}
        </div>
      ) : (
        <div role="alert" className="rounded-md border border-alert/40 bg-[#fbeeec] p-5 text-alert">
          The picture library could not be opened. Your website is still working, but a database administrator needs to
          run the latest database setup before pictures can be changed.
        </div>
      )}
    </>
  );
}
