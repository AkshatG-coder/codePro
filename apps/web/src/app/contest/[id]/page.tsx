import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CountdownTimer from "@/components/CountdownTimer";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const contest = await prisma.contest.findUnique({ where: { id }, select: { title: true } });
  return { title: contest?.title ?? "Contest" };
}

export default async function ContestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id, hidden: false },
    include: {
      contestProblems: {
        include: { problem: { select: { id: true, slug: true, title: true, difficulty: true } } },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!contest) notFound();

  const now = new Date();
  const isActive = contest.startTime <= now && contest.endTime >= now;
  const isUpcoming = contest.startTime > now;

  const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      {/* ── Contest Header ─────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-base) 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "2.5rem 0",
      }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                <Link href="/contests" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>← Contests</Link>
                <span style={{ color: "var(--border)" }}>/</span>
                <span style={{
                  background: isActive ? "rgba(63,185,80,0.15)" : isUpcoming ? "rgba(47,129,247,0.12)" : "rgba(110,118,129,0.12)",
                  color: isActive ? "var(--accent-green)" : isUpcoming ? "var(--accent-blue)" : "var(--text-muted)",
                  padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700,
                }}>
                  {isActive ? "🔴 LIVE" : isUpcoming ? "📅 UPCOMING" : "✅ ENDED"}
                </span>
              </div>

              <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>{contest.title}</h1>

              {contest.description && (
                <p style={{ color: "var(--text-secondary)", maxWidth: 600 }}>{contest.description}</p>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <CountdownTimer startTime={contest.startTime} endTime={contest.endTime} />
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                {contest.startTime.toLocaleDateString()} · {contest.startTime.toLocaleTimeString()} →{" "}
                {contest.endTime.toLocaleTimeString()}
              </div>
              <Link
                href={`/leaderboard/${contest.id}`}
                className="btn btn-secondary"
                style={{ marginTop: "0.75rem", display: "inline-flex" }}
              >
                🏆 Standings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Problems Table ─────────────────────────────────── */}
      <div className="container" style={{ marginTop: "2rem" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: 56 }}>#</th>
                <th>Problem</th>
                <th style={{ width: 120 }}>Difficulty</th>
                <th style={{ width: 100 }}>Points</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {contest.contestProblems.map((cp, i) => (
                <tr key={cp.id}>
                  <td>
                    <span style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: 6, padding: "2px 10px",
                      fontWeight: 700, fontSize: "0.9rem",
                      color: "var(--accent-blue)",
                    }}>
                      {LABELS[i] ?? i + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{cp.problem.title}</td>
                  <td>
                    <span className={`badge badge-${cp.problem.difficulty.toLowerCase()}`}>
                      {cp.problem.difficulty}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--accent-yellow)" }}>{cp.points}</td>
                  <td>
                    <Link
                      href={`/contest/${contest.id}/problem/${cp.problem.id}`}
                      className="btn btn-primary"
                      style={{ padding: "0.375rem 1rem", fontSize: "0.8rem" }}
                    >
                      Solve →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
