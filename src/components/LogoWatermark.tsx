/**
 * Ghost watermark of the Turiya logo mark.
 * Drop inside any `position: relative` image container.
 * Sits above the photo, below any badge overlays.
 */
export function LogoWatermark() {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-45deg)",
        width: "82%",
        height: "82%",
        opacity: 0.13,
        mixBlendMode: "soft-light",
        pointerEvents: "none",
        zIndex: 1,
        display: "block",
      }}
    >
      <path d="M6 6 L38 6 Q44 6, 44 12 L18 38 Q12 44, 6 44 L6 6 Z"          fill="#FAF7F2" />
      <path d="M56 6 L94 6 L94 38 Q94 44, 88 44 L56 12 Q56 6, 62 6 Z"        fill="#FAF7F2" />
      <path d="M94 56 L94 94 L62 94 Q56 94, 56 88 L82 62 Q88 56, 94 56 Z"    fill="#FAF7F2" />
      <circle cx="25" cy="75" r="12" fill="#FAF7F2" />
      <circle cx="25" cy="75" r="5"  fill="#FAF7F2" />
      <circle cx="25" cy="75" r="1.8" fill="#FAF7F2" />
    </svg>
  );
}
