import Link from "next/link";
import PhotoTile from "@/components/PhotoTile";
import type { FeedItem } from "@/lib/activity-feed";

function formatRelative(dateMs: number): string {
  const diffMs = Date.now() - dateMs;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `há ${diffDays}d`;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(dateMs)
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const content = (
    <article className="flex gap-4 border border-line bg-surface p-4 transition-colors hover:border-accent">
      <PhotoTile
        photo={item.photo}
        fit={item.photoFit}
        label={item.title}
        ratio="square"
        compact
        className="w-16 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">{item.title}</p>
        <p className="mt-1 text-xs text-ink-soft">{item.subtitle}</p>
        <p className="mt-2 font-mono-safe text-[11px] uppercase tracking-widest text-muted">
          {formatRelative(item.date)}
        </p>
      </div>
    </article>
  );

  if (!item.href) return content;
  return (
    <Link href={item.href} className="block">
      {content}
    </Link>
  );
}

/** Instagram-style reverse-chronological feed of recent activity — see src/lib/activity-feed.ts for what feeds into it. */
export default function ActivityFeed({ items }: { items: FeedItem[] }) {
  if (items.length === 0) {
    return (
      <p className="border border-dashed border-line-strong bg-surface-2 p-6 text-sm text-muted">
        Nenhuma atividade recente ainda.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
