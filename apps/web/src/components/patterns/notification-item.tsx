import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/components/ui";

// NotificationItem — élément du centre de notifications. Distingue lu / non-lu
// (pastille + fond légèrement teinté). Présentational.

interface NotificationItemProps {
  icon?: LucideIcon;
  title: string;
  body?: string;
  time?: string;
  read?: boolean;
  href?: string;
  className?: string;
}

export function NotificationItem({
  icon: Icon,
  title,
  body,
  time,
  read = false,
  href,
  className,
}: NotificationItemProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          read ? "bg-muted text-muted-foreground" : "bg-primary-soft text-primary",
        )}
      >
        {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {body ? <p className="mt-0.5 text-sm text-muted-foreground">{body}</p> : null}
        {time ? <p className="mt-1 text-xs text-muted-foreground">{time}</p> : null}
      </div>
      {!read ? (
        <span aria-label="Non lu" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      ) : null}
    </>
  );

  const base = "flex items-start gap-3 rounded-lg border border-border p-4";
  const bg = read ? "bg-surface" : "bg-primary-soft/40";

  return href ? (
    <Link
      href={href}
      className={cn(
        base,
        bg,
        "transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {content}
    </Link>
  ) : (
    <div className={cn(base, bg, className)}>{content}</div>
  );
}
