import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  UploadCloud,
  X,
  FileAudio,
  FileVideo,
  AlertCircle,
  Check,
} from "lucide-react";

import {
  MEDIA_RULES,
  acceptAttribute,
  checkFile,
  formatBytes,
} from "@/lib/media-kinds";
import { cn } from "@/lib/utils";

/**
 * Attaches media to a submission by uploading it straight to Cloudinary
 * (v2 Phase 10).
 *
 * The file never passes through our server. A Server Action caps its request
 * body at 1MB, which no video clears, so the browser asks `/api/uploads/sign`
 * for a credential scoped to one destination and POSTs the file to Cloudinary
 * itself. What reaches the form is a manifest of public_ids, which the action
 * then verifies against Cloudinary before trusting a byte of it.
 *
 * The practical benefit of doing it this way is the progress bar: a 40MB upload
 * through a form post is a spinner and a prayer.
 */

export function MediaUploader({
  kind,
  multiple = false,
  max = 1,
  captions = false,
  label,
  hint,
  error,
  onChange,
}) {
  const inputId = useId();
  const [items, setItems] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  // Object URLs are a manual resource; without this a long compose session
  // holds every preview it ever made in memory.
  const previews = useRef(new Set());
  useEffect(
    () => () => {
      for (const url of previews.current) URL.revokeObjectURL(url);
    },
    [],
  );

  /**
   * `items` is also read inside upload callbacks that outlive the render they
   * were created in, so the current value is mirrored into a ref. The mirror is
   * written in an effect rather than during render: a ref assignment in the
   * render body runs on every attempt, including ones React discards, which
   * makes the value unreliable exactly when it is being relied on.
   */
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
    onChange(items);
  }, [items, onChange]);

  const patch = useCallback((localId, changes) => {
    setItems((current) =>
      current.map((item) =>
        item.localId === localId ? { ...item, ...changes } : item,
      ),
    );
  }, []);

  const upload = useCallback(
    async (file, localId) => {
      try {
        const response = await fetch("/api/uploads/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind }),
        });
        const credential = await response.json();

        if (!response.ok) {
          patch(localId, {
            status: "failed",
            error: credential.error ?? "Couldn't start the upload.",
          });
          return;
        }

        const body = new FormData();
        body.append("file", file);
        body.append("api_key", credential.apiKey);
        body.append("timestamp", String(credential.timestamp));
        body.append("signature", credential.signature);
        body.append("public_id", credential.publicId);

        // XHR rather than fetch: fetch still can't report upload progress, and
        // for a 40MB video that progress is the whole difference in feel.
        await new Promise((resolve) => {
          const request = new XMLHttpRequest();
          request.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${credential.cloudName}/${credential.resourceType}/upload`,
          );

          request.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              // Hold at 99 until Cloudinary confirms — bytes sent is not the
              // same as bytes stored.
              patch(localId, {
                progress: Math.min(
                  99,
                  Math.round((event.loaded / event.total) * 100),
                ),
              });
            }
          });

          request.addEventListener("load", () => {
            if (request.status >= 200 && request.status < 300) {
              patch(localId, {
                status: "ready",
                progress: 100,
                publicId: credential.publicId,
              });
            } else {
              patch(localId, {
                status: "failed",
                error: "Cloudinary rejected the file.",
              });
            }
            resolve();
          });

          request.addEventListener("error", () => {
            patch(localId, {
              status: "failed",
              error: "The upload failed. Check your connection.",
            });
            resolve();
          });

          request.addEventListener("abort", () => {
            patch(localId, { status: "failed", error: "Upload cancelled." });
            resolve();
          });

          request.send(body);
        });
      } catch {
        patch(localId, {
          status: "failed",
          error: "The upload failed. Please try again.",
        });
      }
    },
    [kind, patch],
  );

  const accept = useCallback(
    (files) => {
      const room = max - latest.current.length;
      if (room <= 0) return;

      const incoming = Array.from(files).slice(0, room);
      const queued = [];

      for (const file of incoming) {
        const localId = crypto.randomUUID();
        const problem = checkFile(file, kind);

        let previewUrl;
        if (!problem && kind === "image") {
          previewUrl = URL.createObjectURL(file);
          previews.current.add(previewUrl);
        }

        queued.push({
          localId,
          name: file.name,
          size: file.size,
          kind,
          caption: "",
          publicId: "",
          status: problem ? "failed" : "uploading",
          progress: 0,
          error: problem ?? undefined,
          previewUrl,
        });
      }

      setItems((current) => [...current, ...queued]);

      // Start only the files that passed the pre-flight check.
      for (const [index, file] of incoming.entries()) {
        const item = queued[index];
        if (item.status === "uploading") void upload(file, item.localId);
      }
    },
    [kind, max, upload],
  );

  function remove(localId) {
    const item = latest.current.find((entry) => entry.localId === localId);
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
      previews.current.delete(item.previewUrl);
    }
    setItems((current) => current.filter((entry) => entry.localId !== localId));
  }

  const rule = MEDIA_RULES[kind];
  const full = items.length >= max;
  const Icon =
    kind === "audio" ? FileAudio : kind === "video" ? FileVideo : UploadCloud;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={inputId}
          className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]"
        >
          {label}
        </label>
        {max > 1 && (
          <span className="font-mono text-[0.66rem] tabular-nums text-[var(--ink-faint)]">
            {items.length} / {max}
          </span>
        )}
      </div>

      {/* Drop zone. Kept as a real <label> for the input so keyboard and
           screen-reader users get the native file picker, not a div that only
           responds to a mouse. */}
      {!full && (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            accept(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 border border-dashed px-5 py-8 text-center transition-colors",
            dragging
              ? "border-[var(--spot)] bg-[var(--spot)]/8"
              : "border-[var(--rule-strong)] bg-[var(--paper-2)] hover:border-[var(--edge)]",
            error && "border-[var(--spot)]",
          )}
        >
          <Icon className="h-6 w-6 text-[var(--ink-faint)]" aria-hidden />
          <span className="text-[0.9rem] font-semibold text-[var(--ink)]">
            Drop {multiple ? "files" : "a file"} here, or browse
          </span>
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            {rule.formats.join(" · ")} — up to {formatBytes(rule.maxBytes)}
          </span>
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={acceptAttribute(kind)}
        multiple={multiple}
        onChange={(event) => {
          if (event.target.files) accept(event.target.files);
          // Clearing lets the same file be picked again after a removal.
          event.target.value = "";
        }}
      />

      {hint && !error && (
        <p className="text-[0.8rem] text-[var(--ink-faint)]">{hint}</p>
      )}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--spot)]"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={item.localId}
              className="flex items-start gap-3 border border-[var(--rule-strong)] bg-[var(--paper)] p-3"
            >
              <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden border border-[var(--rule)] bg-[var(--paper-2)]">
                {item.previewUrl ? (
                  // Local object URL for a file the member just chose; next/image
                  // has nothing to optimise here and cannot accept a blob URL.
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon
                    className="h-5 w-5 text-[var(--ink-faint)]"
                    aria-hidden
                  />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-[0.88rem] font-medium">
                    {item.name}
                  </p>
                  {item.status === "ready" && (
                    <Check
                      className="h-4 w-4 shrink-0 text-[var(--spot-2)]"
                      aria-hidden
                    />
                  )}
                </div>

                <p className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                  {formatBytes(item.size)}
                  {max > 1 && ` · plate ${index + 1}`}
                </p>

                {item.status === "uploading" && (
                  <div
                    className="mt-2 h-1 w-full bg-[var(--rule)]"
                    role="progressbar"
                    aria-valuenow={item.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Uploading ${item.name}`}
                  >
                    <div
                      className="h-full bg-[var(--spot)] transition-[width] duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {item.status === "failed" && (
                  <p
                    role="alert"
                    className="mt-1 text-[0.8rem] font-medium text-[var(--spot)]"
                  >
                    {item.error}
                  </p>
                )}

                {captions && item.status === "ready" && (
                  <>
                    <label
                      className="sr-only"
                      htmlFor={`caption-${item.localId}`}
                    >
                      Caption for {item.name}
                    </label>
                    <input
                      id={`caption-${item.localId}`}
                      value={item.caption}
                      maxLength={200}
                      placeholder="Caption this image…"
                      onChange={(event) =>
                        patch(item.localId, { caption: event.target.value })
                      }
                      className="mt-2 w-full border border-[var(--rule-strong)] bg-[var(--paper-2)] px-2.5 py-1.5 text-[0.84rem] placeholder:text-[var(--ink-faint)] focus:border-[var(--spot)] focus:outline-none"
                    />
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(item.localId)}
                aria-label={`Remove ${item.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center border border-[var(--rule-strong)] text-[var(--ink-soft)] transition-colors hover:border-[var(--spot)] hover:text-[var(--spot)]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The manifest shape the submit action expects. Only uploads that finished are
 * included — a failed or in-flight file must not become a claim the server then
 * fails to verify.
 */
export function attachmentManifest(items) {
  return items
    .filter((item) => item.status === "ready" && item.publicId)
    .map((item) => ({
      publicId: item.publicId,
      kind: item.kind,
      caption: item.caption,
    }));
}
