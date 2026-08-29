import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const metadata = { title: "Global Leaderboard" };

export const revalidate = 60; // Refresh every 60 seconds

export default async function GlobalLeaderboardPage() {
  // Aggregate total points across all contests for each user
  const userPoints = await prisma.contestPoints.groupBy({
    by: ['userId'],
    _sum: { totalPoints: true },
    orderBy: { _sum: { totalPoints: 'desc' } },
    take: 50,
  });

  // Fetch user details for the aggregated points
  const users = await prisma.user.findMany({
    where: { id: { in: userPoints.map(p => p.userId) } },
    select: { id: true, name: true, image: true },
  });

  const standings = userPoints.map((p, index) => {
    const user = users.find(u => u.id === p.userId);
    return {
      rank: index + 1,
      userId: p.userId,
      name: user?.name || "Unknown",
      image: user?.image || null,
      score: p._sum.totalPoints || 0,
    };
  });

  return (
    <div className="container" style={{ maxWidth: 800, padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Global Leaderboard</h1>
          <p style={{ color: "var(--text-muted)" }}>Top coders across all contests.</p>
        </div>
      </div>

      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        {standings.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            No points awarded yet. Participate in contests to get on the board!
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                <th style={{ padding: "1rem", width: 80 }}>Rank</th>
                <th style={{ padding: "1rem" }}>Coder</th>
                <th style={{ padding: "1rem", textAlign: "right", width: 120 }}>Total Score</th>
              </tr>
            </thead>
            <tbody>
              {standings.map(s => (
                <tr key={s.userId} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "1rem", fontWeight: 700, color: s.rank <= 3 ? "var(--accent-orange)" : "var(--text-primary)" }}>
                    #{s.rank}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-elevated)", overflow: "hidden" }}>
                        {s.image ? (
                          <Image src={s.image} alt={s.name} width={32} height={32} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "var(--text-muted)" }}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, color: "var(--accent-blue)" }}>
                    {s.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
