import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Practice Problems" };
export const dynamic = "force-dynamic";

const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD"];

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; tag?: string }>;
}) {
  const { difficulty, tag } = await searchParams;

  const where: any = { hidden: false };
  if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
  if (tag) where.tags = { has: tag };

  const problems = await prisma.problem.findMany({
    where,
    select: { id: true, slug: true, title: true, difficulty: true, tags: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  // Get all unique tags for filter
  const allProblems = await prisma.problem.findMany({
    where: { hidden: false },
    select: { tags: true },
  });
  const allTags = [...new Set(allProblems.flatMap((p: { tags: string[] }) => p.tags))].sort() as string[];

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      <div style={{
        background: "linear-gradient(135deg, var(--bg-surface), var(--bg-base))",
        borderBottom: "1px solid var(--border)",
        padding: "2.5rem 0",
      }}>
        <div className="container">
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.375rem" }}>📚 Practice Problems</h1>
          <p style={{ color: "var(--text-secondary)" }}>Sharpen your skills with {problems.length} problems across all difficulty levels.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: "2rem" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Difficulty filter */}
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {DIFFICULTIES.map(d => (
              <Link
                key={d}
                href={d === "ALL" ? "/practice" : `/practice?difficulty=${d}`}
                style={{
                  padding: "0.375rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  background: (difficulty ?? "ALL") === d ? "var(--accent-blue)" : "var(--bg-elevated)",
                  color: (difficulty ?? "ALL") === d ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                  transition: "all 0.15s",
                }}
              >
                {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>

          {/* Tag filter */}
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {(allTags as string[]).slice(0, 12).map((t: string) => (
              <Link
                key={t}
                href={tag === t ? "/practice" : `/practice?tag=${t}`}
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  background: tag === t ? "rgba(47,129,247,0.2)" : "var(--bg-elevated)",
                  color: tag === t ? "var(--accent-blue)" : "var(--text-muted)",
                  border: tag === t ? "1px solid rgba(47,129,247,0.4)" : "1px solid var(--border)",
                }}
              >
                {t as string}
              </Link>
            ))}
          </div>
        </div>

        {/* Problems table */}
        {problems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            No problems found. <Link href="/practice" style={{ color: "var(--accent-blue)" }}>Clear filters</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Title</th>
                  <th style={{ width: 120 }}>Difficulty</th>
                  <th>Tags</th>
                  <th style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, i: number) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td>
                      <Link href={`/practice/${p.slug}`} style={{ fontWeight: 600, color: "var(--text-primary)", transition: "color 0.15s" }}>
                        {p.title}
                      </Link>
                    </td>
                    <td><span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                        {p.tags.slice(0, 3).map((t: string) => (
                          <span key={t} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "1px 8px", borderRadius: 12, fontSize: "0.7rem" }}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Link href={`/practice/${p.slug}`} className="btn btn-secondary" style={{ padding: "0.375rem 0.875rem", fontSize: "0.8rem" }}>
                        Solve →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
