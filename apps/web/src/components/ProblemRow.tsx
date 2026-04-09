"use client";
import Link from "next/link";

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  tags: string[];
}

export default function ProblemRow({ problem, index }: { problem: Problem; index: number }) {
  const diffClass = `badge badge-${problem.difficulty.toLowerCase()}`;
  return (
    <tr>
      <td style={{ color: "var(--text-muted)", width: 48 }}>{index}</td>
      <td>
        <Link
          href={`/practice/${problem.slug}`}
          style={{ color: "var(--text-primary)", fontWeight: 500, transition: "color 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-blue)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; }}
        >
          {problem.title}
        </Link>
      </td>
      <td><span className={diffClass}>{problem.difficulty}</span></td>
      <td>
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {problem.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              padding: "1px 8px",
              borderRadius: 12,
              fontSize: "0.7rem",
            }}>{tag}</span>
          ))}
        </div>
      </td>
      <td>
        <Link href={`/practice/${problem.slug}`} style={{ color: "var(--accent-blue)", fontSize: "0.85rem" }}>
          Solve →
        </Link>
      </td>
    </tr>
  );
}
