"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export default function CountdownTimer({ endTime, startTime }: { endTime: Date; startTime: Date }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = now < startTime ? startTime : endTime;
  const label  = now < startTime ? "Starts in" : "Ends in";
  const diff   = target.getTime() - now.getTime();

  if (diff <= 0) {
    return <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Contest ended</span>;
  }

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</span>
      <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
        {[
          [pad(h), "h"],
          [pad(m), "m"],
          [pad(s), "s"],
        ].map(([val, unit]) => (
          <div key={unit} style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "2px 8px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--accent-blue)",
              minWidth: 40,
              textAlign: "center",
            }}>{val}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
