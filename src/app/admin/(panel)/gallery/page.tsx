import { AdminTitle, EmptyNote } from "@/components/admin-ui";
import { GalleryItemEditor, GalleryUploader } from "@/components/gallery-manager";
import { requireAdmin } from "@/lib/auth";
import { ensureGalleryTable, getGalleryPhotos } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdmin();
  let ready = true;
  try { await ensureGalleryTable(); } catch { ready = false; }
  const photos = ready ? await getGalleryPhotos() : [];

  return (
    <>
      <AdminTitle title="Program gallery">Add, replace or remove photographs from your programs and gatherings.</AdminTitle>
      <div className="mb-6 rounded-md border border-brass-500/40 bg-[#f7f2da] px-5 py-4 text-ink">
        Photos added here are visible to everyone. Please get permission from people shown, especially before posting pictures of children.
      </div>
      {ready ? (
        <>
          <GalleryUploader />
          <div className="mb-4 mt-10 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-sans text-xl font-bold">Photos on your site</h2>
            <a href="/gallery" target="_blank" rel="noopener" className="font-semibold text-night-700 underline underline-offset-4">View public gallery ↗</a>
          </div>
          {photos.length ? <div className="space-y-4">{photos.map((photo) => <GalleryItemEditor key={photo.id} photo={photo} />)}</div> : <EmptyNote>No program photos yet. Add your first pictures using the form above.</EmptyNote>}
        </>
      ) : (
        <div role="alert" className="rounded-md border border-alert/40 bg-[#fbeeec] p-5 text-alert">The gallery could not be opened. Your website is still working, but a database administrator needs to run the latest database setup before gallery photos can be added.</div>
      )}
    </>
  );
}
