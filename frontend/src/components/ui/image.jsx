import { forwardRef } from "react";

/**
 * Plain `<img>` with the handful of props the pages were written against.
 *
 * - `fill` stretches the image over its positioned parent (the parent sets the
 *   box; `className` supplies `object-cover` / `object-position`).
 * - `priority` marks above-the-fold art: loaded eagerly at high priority
 *   rather than lazily.
 * - `sizes` is passed through for any `srcSet` a caller supplies.
 * - `quality` is accepted and ignored — files are served as they are.
 */
export const Image = forwardRef(function Image(
  {
    src,
    alt = "",
    fill = false,
    priority = false,
    width,
    height,
    sizes,
    quality: _quality,
    unoptimized: _unoptimized,
    placeholder: _placeholder,
    style,
    ...rest
  },
  ref,
) {
  const fillStyle = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        color: "transparent",
      }
    : { color: "transparent" };

  return (
    <img
      ref={ref}
      src={typeof src === "object" && src ? src.src : src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={{ ...fillStyle, ...style }}
      {...rest}
    />
  );
});
