import Link from "next/link";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

/**
 * Month grid for the public agenda (src/app/central-do-airsoft/page.tsx):
 * `year`/`month` (1-12) pick the month shown; `eventCountByDate` keys are
 * "AAAA-MM-DD" strings. Prev/next are plain links (`?month=AAAA-MM`) — no
 * client JS needed, consistent with this project's other query-param-driven
 * pages (see src/app/conta/(protected)/agendamentos/page.tsx).
 */
export default function MonthCalendar({
  year,
  month,
  eventCountByDate,
  basePath,
}: {
  year: number;
  month: number;
  eventCountByDate: Map<string, number>;
  basePath: string;
}) {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leadingBlanks = firstOfMonth.getUTCDay(); // 0 = domingo

  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  return (
    <div className="border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Link
          href={`${basePath}?month=${prev.year}-${pad(prev.month)}`}
          className="rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors"
        >
          ← Anterior
        </Link>
        <p className="font-display text-lg font-semibold text-ink">
          {MONTH_LABELS[month - 1]} {year}
        </p>
        <Link
          href={`${basePath}?month=${next.year}-${pad(next.month)}`}
          className="rounded-sm border border-line-strong px-3 py-1.5 font-mono-safe text-xs uppercase tracking-widest text-ink hover:border-accent hover:text-accent transition-colors"
        >
          Próximo →
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <p key={label} className="font-mono-safe text-[10px] uppercase tracking-widest text-muted">
            {label}
          </p>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const dateKey = `${year}-${pad(month)}-${pad(day)}`;
          const count = eventCountByDate.get(dateKey) ?? 0;
          return (
            <div
              key={dateKey}
              className={`flex aspect-square flex-col items-center justify-center rounded-sm border text-sm ${
                count > 0 ? "border-accent bg-accent/10 text-ink font-medium" : "border-line text-ink-soft"
              }`}
            >
              {day}
              {count > 0 && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
