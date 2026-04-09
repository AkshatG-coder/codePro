import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ContestCard from "@/components/ContestCard";

export const metadata: Metadata = { title: "Contests" };
export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  const now = new Date();
  const contests = await prisma.contest.findMany({
    where: { hidden: false },
    orderBy: { startTime: "desc" },
  });

  const active   = contests.filter(c => c.startTime <= now && c.endTime >= now);
  const upcoming = contests.filter(c => c.startTime > now);
  const past     = contests.filter(c => c.endTime < now);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      <div style={{
        background: "linear-gradient(135deg, var(--bg-surface), var(--bg-base))",
        borderBottom: "1px solid var(--border)",
        padding: "2.5rem 0",
      }}>
        <div className="container">
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.375rem" }}>🏆 Contests</h1>
          <p style={{ color: "var(--text-secondary)" }}>Compete against others, earn points, and climb the global rankings.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {active.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--accent-green)" }}>🔴 Live Contests</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {active.map(c => <ContestCard key={c.id} contest={c} variant="active" />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>📅 Upcoming</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {upcoming.map(c => <ContestCard key={c.id} contest={c} variant="upcoming" />)}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-muted)" }}>📖 Past Contests</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {past.map(c => <ContestCard key={c.id} contest={c} variant="past" />)}
            </div>
          </section>
        )}

        {contests.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
            <p>No contests yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
