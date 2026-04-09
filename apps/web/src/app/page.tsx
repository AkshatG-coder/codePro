import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ContestCard from "@/components/ContestCard";
import ProblemRow from "@/components/ProblemRow";

export const metadata: Metadata = {
  title: "CodePro — Competitive Programming Platform",
  description: "Join contests, solve algorithmic problems, and compete with programmers worldwide.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();

  const [contests, problems] = await Promise.all([
    prisma.contest.findMany({
      where: { hidden: false },
      orderBy: { startTime: "desc" },
      take: 9,
    }),
    prisma.problem.findMany({
      where: { hidden: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, slug: true, title: true, difficulty: true, tags: true },
    }),
  ]);

  const activeContests   = contests.filter(c => c.startTime <= now && c.endTime >= now);
  const upcomingContests = contests.filter(c => c.startTime > now);
  const pastContests     = contests.filter(c => c.endTime < now);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        background: "var(--gradient-hero)",
        borderBottom: "1px solid var(--border)",
        padding: "5rem 0 4rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow orbs */}
        <div style={{
          position: "absolute", top: -100, left: "20%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(47,129,247,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 0, right: "10%", width: 300, height: 300,
          background: "radial-gradient(circle, rgba(163,113,247,0.1) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div className="container" style={{ textAlign: "center", position: "relative" }}>
          <div className="animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <span style={{
              display: "inline-block",
              background: "rgba(47,129,247,0.15)",
              border: "1px solid rgba(47,129,247,0.3)",
              color: "var(--accent-blue)",
              padding: "4px 14px",
              borderRadius: 20,
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              letterSpacing: "0.05em",
            }}>
              🚀 Competitive Programming Platform
            </span>
          </div>

          <h1 className="animate-fade-up" style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "1.25rem",
            animationDelay: "0.2s",
            opacity: 0,
          }}>
            <span style={{
              background: "linear-gradient(135deg, #e6edf3 30%, var(--accent-blue))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Code. Compete.
            </span>
            <br />
            <span style={{ color: "var(--accent-purple)" }}>Conquer.</span>
          </h1>

          <p className="animate-fade-up" style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            maxWidth: 560,
            margin: "0 auto 2.5rem",
            lineHeight: 1.75,
            animationDelay: "0.3s",
            opacity: 0,
          }}>
            Join live contests, solve algorithmic challenges with our in-browser IDE,
            and see your submissions judged in real-time.
          </p>

          <div className="animate-fade-up" style={{ display: "flex", gap: "1rem", justifyContent: "center", animationDelay: "0.4s", opacity: 0 }}>
            <Link href="/contests" className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
              View Contests →
            </Link>
            <Link href="/practice" className="btn btn-secondary" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
              Practice Problems
            </Link>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up" style={{
            display: "flex", gap: "2rem", justifyContent: "center",
            marginTop: "3rem", animationDelay: "0.5s", opacity: 0,
          }}>
            {[
              ["🏆", contests.length, "Contests"],
              ["📝", problems.length, "Problems"],
              ["⚡", "Real-time", "Judging"],
            ].map(([icon, val, label]) => (
              <div key={label as string} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-blue)" }}>
                  {icon} {val}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>

        {/* ── Active Contests ─────────────────────────────────── */}
        {activeContests.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <SectionHeader title="🔴 Live Contests" href="/contests" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {activeContests.map(c => <ContestCard key={c.id} contest={c} variant="active" />)}
            </div>
          </section>
        )}

        {/* ── Upcoming Contests ───────────────────────────────── */}
        {upcomingContests.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <SectionHeader title="📅 Upcoming Contests" href="/contests" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {upcomingContests.map(c => <ContestCard key={c.id} contest={c} variant="upcoming" />)}
            </div>
          </section>
        )}

        {/* ── Practice Problems ───────────────────────────────── */}
        <section style={{ marginBottom: "3rem" }}>
          <SectionHeader title="📚 Practice Problems" href="/practice" />
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, i) => (
                  <ProblemRow key={p.id} problem={p} index={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Past Contests ───────────────────────────────────── */}
        {pastContests.length > 0 && (
          <section style={{ marginBottom: "3rem" }}>
            <SectionHeader title="📖 Past Contests" href="/contests" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {pastContests.map(c => <ContestCard key={c.id} contest={c} variant="past" />)}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{title}</h2>
      <Link href={href} style={{ fontSize: "0.875rem", color: "var(--accent-blue)" }}>View all →</Link>
    </div>
  );
}
