import { deleteGalleryPhoto, saveGalleryPhoto } from "@/app/actions/admin";
import { ActionForm, ConfirmAction } from "@/components/admin-client";
import { AField, AdminCard, AdminTitle, EmptyNote, StarterBadge } from "@/components/admin-ui";
import { PicturePicker } from "@/components/picture-picker";
import { requireAdmin } from "@/lib/auth";
import { gallerySrc, getGalleryPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const photos = await getGalleryPhotos();

  return (
    <>
      <AdminTitle title="Gallery">
        Photos from your services and programs, shown on the Gallery page of your website. Add as many as you
        like — the newest appears last.
      </AdminTitle>

      <AdminCard title="Add a photo">
        <ActionForm action={saveGalleryPhoto} submitLabel="Add to gallery" pendingLabel="Adding…" resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-2">
            <PicturePicker
              name="file"
              hint="Any picture format works — JPG, PNG, WebP, GIF, BMP, TIFF, HEIC (iPhone), AVIF or SVG — up to 10 MB. It is converted for you automatically."
            />
            <AField
              label="Caption"
              name="caption"
              maxLength={160}
              placeholder="Easter Sunday service"
              hint="A few words about the photo. Shown under it on the website."
            />
          </div>
        </ActionForm>
      </AdminCard>

      <h2 className="mb-4 mt-10 font-sans text-xl font-bold">In your gallery now</h2>
      {photos.length === 0 ? (
        <EmptyNote>No photos yet. Add your first one with the form above.</EmptyNote>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="a-card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gallerySrc(photo)} alt={photo.caption} className="aspect-[4/3] w-full object-cover" />
              <div className="p-4">
                <p className="flex min-h-6 flex-wrap items-center gap-2 font-semibold">
                  {photo.caption || <span className="text-ink-soft">No caption</span>}
                  {photo.isSample ? <StarterBadge /> : null}
                </p>
                <div className="mt-3">
                  <ConfirmAction
                    action={deleteGalleryPhoto}
                    fields={{ id: photo.id }}
                    label="Remove photo"
                    question="Remove this photo from the gallery?"
                    confirmLabel="Yes, remove"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
