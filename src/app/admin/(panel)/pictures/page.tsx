import { deleteImage, saveImage } from "@/app/actions/admin";
import { ActionForm, ConfirmAction } from "@/components/admin-client";
import { AdminCard, AdminTitle } from "@/components/admin-ui";
import { PicturePicker } from "@/components/picture-picker";
import { Mark } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { IMAGE_DEFAULTS, getUploadedImages } from "@/lib/data";
import type { ImageKey } from "@/lib/format";

export const dynamic = "force-dynamic";

const SLOTS: { key: ImageKey; title: string; where: string; tip: string }[] = [
  {
    key: "logo",
    title: "Your logo",
    where: "Beside the ministry name at the top and bottom of every page, and on the staff sign-in screen.",
    tip: "A logo on a transparent background (PNG) usually looks best.",
  },
  {
    key: "hero",
    title: "Main sanctuary picture",
    where: "The tall picture on the home page, shown again on the Prayer page.",
    tip: "A tall (portrait) photo suits this space.",
  },
  {
    key: "doors",
    title: "Welcome picture",
    where: "Next to the welcome message on the home page.",
    tip: "A tall (portrait) photo suits this space.",
  },
  {
    key: "leader",
    title: "Pastor's portrait",
    where: "On the About page, next to the pastor's name and story.",
    tip: "A portrait photo of the pastor. A tall (portrait) photo suits this space.",
  },
  {
    key: "bible",
    title: "Sermon picture",
    where: "Next to the latest sermon on the home page.",
    tip: "A wide (landscape) photo suits this space.",
  },
  {
    key: "pews",
    title: "About page picture",
    where: "On the About page, beside your story.",
    tip: "A wide (landscape) photo suits this space.",
  },
];

export default async function AdminPicturesPage() {
  await requireAdmin();
  const uploads = await getUploadedImages();

  return (
    <>
      <AdminTitle title="Pictures & logo">
        Use your own photographs of the church, and your own logo if you have one. Changes appear on the website
        straight away. If you remove your picture, the standard one comes back.
      </AdminTitle>

      <div className="space-y-6">
        {SLOTS.map((slot) => {
          const version = uploads.get(slot.key);
          const src = version ? `/media/${slot.key}?v=${version}` : IMAGE_DEFAULTS[slot.key];
          return (
            <AdminCard key={slot.key} title={slot.title}>
              <div className="flex flex-wrap items-start gap-6">
                <div className="shrink-0">
                  {!src ? (
                    <div className="flex h-28 w-28 items-center justify-center rounded border border-rule bg-night-900">
                      <Mark className="h-14 w-11 text-brass-300" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt=""
                      className="h-28 w-28 rounded border border-rule bg-night-900 object-cover"
                    />
                  )}
                  <p className="mt-2">
                    {version ? (
                      <span className="a-badge a-badge-new">Your picture</span>
                    ) : (
                      <span className="a-badge">Standard picture</span>
                    )}
                  </p>
                </div>
                <div className="min-w-64 flex-1">
                  <p className="-mt-1 max-w-xl text-ink-soft">{slot.where}</p>
                  <ActionForm action={saveImage} submitLabel="Upload picture" pendingLabel="Uploading…">
                    <input type="hidden" name="key" value={slot.key} />
                    <PicturePicker
                      name="file"
                      hint={`Any picture format works — JPG, PNG, WebP, GIF, BMP, TIFF, HEIC (iPhone), AVIF or SVG — up to 10 MB. It is converted for you automatically. ${slot.tip}`}
                    />
                  </ActionForm>
                  {version ? (
                    <div className="mt-4">
                      <ConfirmAction
                        action={deleteImage}
                        fields={{ key: slot.key }}
                        label="Remove my picture"
                        question="Remove your picture and bring back the standard one?"
                        confirmLabel="Yes, remove"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>
    </>
  );
}
