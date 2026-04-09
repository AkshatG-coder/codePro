import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CountdownTimer from "@/components/CountdownTimer";
import LiveLeaderboard from "@/components/LiveLeaderboard";

export async function generateMetadata({ params }: { params: Promise<{ contestId: string }> }): Promise<Metadata> {
  const { contestId } = await params;
  const contest = await prisma.contest.findUnique({ where: { id: contestId }, select: { title: true } });
  return { title: `Leaderboard — ${contest?.title ?? "Contest"}` };
}

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ params }: { params: Promise<{ contestId: string }> }) {
  const { contestId } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id: contestId, hidden: false },
    include: {
      contestProblems: {
        include: { problem: { select: { id: true, title: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!contest) notFound();

  const now       = new Date();
  const isActive  = contest.startTime <= now && contest.endTime >= now;
  const isUpcoming = contest.startTime > now;

  // SSR initial standings
  const rawStandings = await prisma.contestPoints.findMany({
    where: { contestId },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { totalPoints: "desc" },
  });

  const initialStandings = rawStandings.map((e, i) => ({
    rank: i + 1,
    user: e.user,
    totalPoints: e.totalPoints,
  }));

  const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      {/* ── Header ───────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-base) 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "2.5rem 0",
      }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                <Link href={`/contest/${contestId}`} style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  ← {contest.title}
                </Link>
                <span style={{ color: "var(--border)" }}>/</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Leaderboard</span>
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>
                🏆 Standings
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {isActive ? "Live rankings — updates automatically" : isUpcoming ? "Contest hasn't started yet" : "Final standings"}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
              {(isActive || isUpcoming) && (
                <CountdownTimer startTime={contest.startTime} endTime={contest.endTime} />
              )}
              <Link href={`/contest/${contestId}`} className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>
                ← Back to Problems
              </Link>
            </div>
          </div>

          {/* Problem legend */}
          {contest.contestProblems.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
              {contest.contestProblems.map((cp, i) => (
                <Link
                  key={cp.id}
                  href={`/contest/${contestId}/problem/${cp.problem.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "4px 12px", borderRadius: "var(--radius-md)",
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    fontSize: "0.8rem", color: "var(--text-secondary)",
                    transition: "border-color 0.15s",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "var(--accent-blue)" }}>{LABELS[i]}</span>
                  {cp.problem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Live Leaderboard Table ───────────────────────── */}
      <div className="container" style={{ marginTop: "2rem" }}>
        {isUpcoming ? (
          <div style={{
            textAlign: "center", padding: "5rem",
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <h2 style={{ marginBottom: "0.5rem" }}>Contest hasn't started yet</h2>
            <p style={{ color: "var(--text-muted)" }}>Come back when the contest begins to see live standings.</p>
          </div>
        ) : (
          <LiveLeaderboard
            contestId={contestId}
            isActive={isActive}
            initialStandings={initialStandings}
          />
        )}
      </div>
    </div>
  );
}
