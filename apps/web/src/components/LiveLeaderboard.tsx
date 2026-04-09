"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Standing {
  rank: number;
  user: { id: string; name: string | null; image: string | null };
  totalPoints: number;
}

interface Props {
  contestId: string;
  isActive: boolean;
  initialStandings: Standing[];
}

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const MEDAL_EMOJI  = ["🥇", "🥈", "🥉"];

export default function LiveLeaderboard({ contestId, isActive, initialStandings }: Props) {
  const [standings, setStandings]       = useState<Standing[]>(initialStandings);
  const [connected, setConnected]       = useState(false);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [flashIds, setFlashIds]         = useState<Set<string>>(new Set());
  const prevStandingsRef                = useRef<Standing[]>(initialStandings);
  const esRef                           = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const es = new EventSource(`/api/leaderboard/${contestId}/stream`);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as { standings: Standing[] };
      const incoming = data.standings;

      // Detect rank changes to flash-animate them
      const changed = new Set<string>();
      incoming.forEach((s) => {
        const prev = prevStandingsRef.current.find(p => p.user.id === s.user.id);
        if (prev && prev.rank !== s.rank) changed.add(s.user.id);
      });

      if (changed.size) {
        setFlashIds(changed);
        setTimeout(() => setFlashIds(new Set()), 1500);
      }

      prevStandingsRef.current = incoming;
      setStandings(incoming);
      setLastUpdated(new Date());
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => { es.close(); setConnected(false); };
  }, [contestId, isActive]);

  return (
    <div>
      {/* Live indicator */}
      {isActive && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "1.25rem",
          padding: "0.5rem 1rem",
          background: connected ? "rgba(63,185,80,0.08)" : "rgba(248,81,73,0.08)",
          border: `1px solid ${connected ? "rgba(63,185,80,0.25)" : "rgba(248,81,73,0.25)"}`,
          borderRadius: "var(--radius-md)",
          width: "fit-content",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: connected ? "var(--accent-green)" : "var(--accent-red)",
            boxShadow: connected ? "0 0 6px var(--accent-green)" : "none",
            animation: connected ? "pulse-glow 2s infinite" : "none",
            display: "inline-block",
          }} />
          <span style={{ fontSize: "0.8rem", color: connected ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600 }}>
            {connected ? "Live — updating every 5s" : "Reconnecting..."}
          </span>
          {lastUpdated && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              · Last updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {standings.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem",
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏁</div>
          <p style={{ color: "var(--text-muted)" }}>No submissions yet. Be the first to score!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: 64 }}>Rank</th>
                <th>Participant</th>
                <th style={{ width: 140, textAlign: "right" }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s) => {
                const isFlashing = flashIds.has(s.user.id);
                const isTop3 = s.rank <= 3;
                return (
                  <tr
                    key={s.user.id}
                    style={{
                      background: isFlashing
                        ? "rgba(47,129,247,0.12)"
                        : isTop3 ? `rgba(${s.rank === 1 ? "255,215,0" : s.rank === 2 ? "192,192,192" : "205,127,50"},0.06)` : undefined,
                      transition: "background 0.5s",
                    }}
                  >
                    {/* Rank */}
                    <td>
                      {isTop3 ? (
                        <span style={{ fontSize: "1.2rem" }}>{MEDAL_EMOJI[s.rank - 1]}</span>
                      ) : (
                        <span style={{
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          #{s.rank}
                        </span>
                      )}
                    </td>

                    {/* User */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {s.user.image ? (
                          <img
                            src={s.user.image}
                            alt={s.user.name ?? ""}
                            style={{
                              width: 36, height: 36, borderRadius: "50%",
                              border: isTop3 ? `2px solid ${MEDAL_COLORS[s.rank - 1]}` : "2px solid var(--border)",
                            }}
                          />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.875rem", fontWeight: 700, color: "#fff",
                            border: isTop3 ? `2px solid ${MEDAL_COLORS[s.rank - 1]}` : "2px solid var(--border)",
                          }}>
                            {s.user.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                        <span style={{ fontWeight: isTop3 ? 700 : 500 }}>{s.user.name ?? "Anonymous"}</span>
                        {isFlashing && (
                          <span style={{
                            fontSize: "0.7rem", fontWeight: 700,
                            color: "var(--accent-blue)",
                            background: "rgba(47,129,247,0.15)",
                            padding: "1px 8px", borderRadius: 12,
                            animation: "fadeUp 0.3s ease",
                          }}>
                            ↑ moved up
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td style={{ textAlign: "right" }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isTop3 ? MEDAL_COLORS[s.rank - 1] : "var(--accent-yellow)",
                      }}>
                        {s.totalPoints}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: 4 }}>pts</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
