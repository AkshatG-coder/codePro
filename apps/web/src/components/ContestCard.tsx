"use client";
import Link from "next/link";
import { formatDistanceToNow, isPast, isFuture } from "date-fns";

interface Contest {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
}

interface Props {
  contest: Contest;
  variant: "active" | "upcoming" | "past";
}

export default function ContestCard({ contest, variant }: Props) {
  const variantStyles = {
    active: {
      border: "1px solid rgba(63,185,80,0.4)",
      glow: "0 0 20px rgba(63,185,80,0.1)",
      badge: "🔴 LIVE",
      badgeColor: "var(--accent-green)",
      badgeBg: "rgba(63,185,80,0.15)",
    },
    upcoming: {
      border: "1px solid rgba(47,129,247,0.3)",
      glow: "none",
      badge: "📅 UPCOMING",
      badgeColor: "var(--accent-blue)",
      badgeBg: "rgba(47,129,247,0.12)",
    },
    past: {
      border: "1px solid var(--border)",
      glow: "none",
      badge: "✅ ENDED",
      badgeColor: "var(--text-muted)",
      badgeBg: "rgba(110,118,129,0.12)",
    },
  }[variant];

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: variantStyles.border,
      borderRadius: "var(--radius-lg)",
      padding: "1.25rem",
      boxShadow: variantStyles.glow,
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <span style={{
          background: variantStyles.badgeBg,
          color: variantStyles.badgeColor,
          padding: "2px 10px",
          borderRadius: 20,
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}>
          {variantStyles.badge}
        </span>
      </div>

      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text-primary)" }}>
        {contest.title}
      </h3>

      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
        {variant === "active" && `Ends ${formatDistanceToNow(contest.endTime, { addSuffix: true })}`}
        {variant === "upcoming" && `Starts ${formatDistanceToNow(contest.startTime, { addSuffix: true })}`}
        {variant === "past" && `Ended ${formatDistanceToNow(contest.endTime, { addSuffix: true })}`}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Link
          href={`/contest/${contest.id}`}
          style={{
            flex: 1,
            display: "block",
            textAlign: "center",
            padding: "0.5rem",
            borderRadius: "var(--radius-md)",
            background: variant === "active" ? "var(--accent-green)" : variant === "upcoming" ? "var(--accent-blue)" : "var(--bg-elevated)",
            color: variant === "past" ? "var(--text-secondary)" : "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            border: variant === "past" ? "1px solid var(--border)" : "none",
            transition: "opacity 0.2s",
          }}
        >
          {variant === "active" ? "Join Now" : variant === "upcoming" ? "View Details" : "View Results"}
        </Link>
        {variant !== "past" && (
          <Link
            href={`/leaderboard/${contest.id}`}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              border: "1px solid var(--border)",
            }}
          >
            🏆
          </Link>
        )}
      </div>
    </div>
  );
}
