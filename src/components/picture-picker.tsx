"use client";

import { useId, useState } from "react";

/** Upload limit shared with the server. */
export const MAX_UPLOAD_BYTES = 10_000_000;

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/heic,image/heif,image/avif,image/svg+xml";

/**
 * A picture chooser that checks the file straight away, so a picture that is
 * too big is explained before it ever leaves the visitor's computer.
 */
export function PicturePicker({ name, hint }: { name: string; hint: string }) {
  const id = useId();
  const [problem, setProblem] = useState("");

  return (
    <div>
      <label htmlFor={id} className="a-label">
        Choose a picture from your computer or phone
      </label>
      <input
        id={id}
        type="file"
        name={name}
        required
        accept={ACCEPT}
        className="a-input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && file.size > MAX_UPLOAD_BYTES) {
            setProblem(
              `“${file.name}” is bigger than 10 MB. Send a smaller picture, or shrink it on your phone first.`,
            );
            event.target.value = ""; // clear the chosen file so it cannot be sent
          } else {
            setProblem("");
          }
        }}
      />
      {problem ? (
        <p role="alert" className="a-hint" style={{ color: "var(--color-alert)", fontWeight: 600 }}>
          {problem}
        </p>
      ) : (
        <span className="a-hint">{hint}</span>
      )}
    </div>
  );
}
