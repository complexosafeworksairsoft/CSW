"use client";

/**
 * Destructive submit button meant to sit inside a Server Action <form>
 * (e.g. removeOperatorAction / removeEquipmentAction). Looks like an actual
 * button — matching the weight/sizing of the "Adicionar operador" submit
 * button — instead of the bare uppercase text link this replaces, and asks
 * for confirmation before submitting since these deletes have no undo in
 * this prototype.
 */
export default function ConfirmDeleteButton({
  label,
  confirmMessage,
  size = "md",
}: {
  label: string;
  confirmMessage: string;
  size?: "md" | "sm";
}) {
  const sizing =
    size === "sm"
      ? "px-3 py-1.5 text-[11px] gap-1.5"
      : "px-4 py-2 text-xs gap-2";

  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={`inline-flex items-center rounded-sm border border-line-strong font-mono-safe uppercase tracking-widest text-muted hover:border-accent hover:text-accent transition-colors ${sizing}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
      >
        <path d="M4 7h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
      {label}
    </button>
  );
}
