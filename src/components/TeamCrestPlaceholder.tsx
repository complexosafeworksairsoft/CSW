/** Generic, undefined-looking crest — shown next to an operator's name when they have no team yet, or their team never uploaded a photo. Deliberately featureless (no initials, no color): it should read as "unknown", not as a real team's mark. */
export default function TeamCrestPlaceholder({
  label = "Sem equipe",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-sm border border-line-strong bg-black ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-2/3 w-2/3"
        fill="#161616"
        stroke="#3a3a3a"
        strokeWidth="1.25"
      >
        <path d="M12 2.5l7.5 2.7v5.6c0 5-3.3 8.4-7.5 10.7-4.2-2.3-7.5-5.7-7.5-10.7V5.2L12 2.5z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
