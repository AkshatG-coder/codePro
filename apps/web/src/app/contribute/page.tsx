"use client";

import { useState } from "react";
import Link from "next/link";

const STEPS = [
  {
    icon: "🍴",
    title: "Fork the Repository",
    desc: "Start by forking the CodePro GitHub repository to your own account.",
    code: "# Click 'Fork' on GitHub, then clone your fork\ngit clone https://github.com/YOUR_USERNAME/code-pro.git\ncd code-pro",
  },
  {
    icon: "📁",
    title: "Create a Problem Folder",
    desc: "Inside scripts/problems/, create a folder with your problem's slug.",
    code: "mkdir scripts/problems/your-problem-slug\ncd scripts/problems/your-problem-slug",
  },
  {
    icon: "📝",
    title: "Write structure.md",
    desc: "Define the function signature, parameter types, and return type. Our generator will auto-create boilerplates for C++, JS, and Rust.",
    code: `# structure.md
# function: twoSum
## params
- nums: int[]
- target: int
## return
- int[]`,
  },
  {
    icon: "📄",
    title: "Write description.md",
    desc: "Write the full problem statement in Markdown — examples, constraints, all of it.",
    code: `# Two Sum

Given an array of integers **nums** and an integer **target**, 
return indices of the two numbers such that they add up to target.

## Examples
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
\`\`\`

## Constraints
- 2 ≤ nums.length ≤ 10⁴`,
  },
  {
    icon: "🧪",
    title: "Add Test Cases",
    desc: "Create a testcases/ folder with numbered .txt files (input and expected output).",
    code: `testcases/
├── 1.in  → "4\\n2 7 11 15\\n9"
├── 1.out → "0 1"
├── 2.in  → "3\\n3 2 4\\n6"
└── 2.out → "1 2"`,
  },
  {
    icon: "⚙️",
    title: "Run the Generator",
    desc: "Use our script to auto-generate boilerplates and validate everything.",
    code: `# From repo root:
npm run generate --problem=your-problem-slug

# This outputs partial boilerplate (shown to users)
# and full boilerplate (reads stdin, calls your func)`,
  },
  {
    icon: "🚀",
    title: "Open a Pull Request",
    desc: "Push your branch and open a PR. Reference your suggestion ID in the title so we can track it.",
    code: `git checkout -b add/your-problem-slug
git add scripts/problems/your-problem-slug/
git commit -m "feat: add 'Your Problem Title' problem"
git push origin add/your-problem-slug
# Then open a PR on GitHub!`,
  },
];

const TAGS_OPTIONS = ["Arrays", "HashMap", "Binary Search", "DP", "Graphs", "Trees", "Strings", "Math", "Greedy", "Sorting", "Two Pointers", "Sliding Window"];

export default function ContributePage() {
  const [form, setForm] = useState({
    title: "",
    difficulty: "MEDIUM",
    description: "",
    tags: [] as string[],
    sampleInput: "",
    sampleOutput: "",
    githubUsername: "",
    referenceLink: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag].slice(0, 5),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); return; }
      setSubmitted(true);
    } catch {
      setError("Network error, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "5rem" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-base) 0%, var(--bg-surface) 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "4rem 0 3rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: "15%", width: 350, height: 350,
          background: "radial-gradient(circle, rgba(163,113,247,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div className="container" style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(163,113,247,0.12)", border: "1px solid rgba(163,113,247,0.3)",
            color: "var(--accent-purple)", padding: "4px 14px", borderRadius: 20,
            fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem",
          }}>
            🤝 Open Source Contributions
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem",
            background: "linear-gradient(135deg, var(--text-primary) 30%, var(--accent-purple))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Contribute a Problem
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: 560, margin: "0 auto" }}>
            Suggest a problem idea or contribute directly via GitHub Pull Request.
            We review every submission and guide you through the process.
          </p>
        </div>
      </div>

      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginTop: "3rem", alignItems: "start" }}>

        {/* ── LEFT: Suggestion Form ───────────────────────── */}
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            💡 Suggest a Problem
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Don't have time to write the full PR? Just fill this out — we'll review it and reach out via GitHub.
          </p>

          {submitted ? (
            <div style={{
              background: "rgba(63,185,80,0.1)", border: "1px solid rgba(63,185,80,0.3)",
              borderRadius: "var(--radius-lg)", padding: "2rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
              <h3 style={{ color: "var(--accent-green)", marginBottom: "0.5rem" }}>Suggestion submitted!</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                We'll review your idea and may reach out to guide you through contributing a PR.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ title: "", difficulty: "MEDIUM", description: "", tags: [], sampleInput: "", sampleOutput: "", githubUsername: "", referenceLink: "" }); }}
                className="btn btn-secondary"
                style={{ marginTop: "1.25rem" }}
              >
                Suggest Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                  Problem Title *
                </label>
                <input
                  className="input"
                  required
                  placeholder='e.g. "Two Sum", "Longest Common Subsequence"'
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                  Difficulty *
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["EASY", "MEDIUM", "HARD"].map(d => (
                    <button key={d} type="button" onClick={() => setForm(f => ({ ...f, difficulty: d }))} style={{
                      flex: 1, padding: "0.5rem",
                      borderRadius: "var(--radius-md)",
                      border: form.difficulty === d
                        ? `2px solid ${d === "EASY" ? "var(--accent-green)" : d === "MEDIUM" ? "var(--accent-yellow)" : "var(--accent-red)"}`
                        : "1px solid var(--border)",
                      background: form.difficulty === d
                        ? `rgba(${d === "EASY" ? "63,185,80" : d === "MEDIUM" ? "210,153,34" : "248,81,73"},0.12)`
                        : "var(--bg-elevated)",
                      color: form.difficulty === d
                        ? (d === "EASY" ? "var(--accent-green)" : d === "MEDIUM" ? "var(--accent-yellow)" : "var(--accent-red)")
                        : "var(--text-muted)",
                      fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                    }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                  Tags (up to 5)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                  {TAGS_OPTIONS.map(tag => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", cursor: "pointer",
                      background: form.tags.includes(tag) ? "rgba(47,129,247,0.2)" : "var(--bg-elevated)",
                      color: form.tags.includes(tag) ? "var(--accent-blue)" : "var(--text-muted)",
                      border: form.tags.includes(tag) ? "1px solid rgba(47,129,247,0.4)" : "1px solid var(--border)",
                      fontWeight: 500, transition: "all 0.15s",
                    }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                  Problem Description * <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(brief idea is fine)</span>
                </label>
                <textarea
                  className="input"
                  required
                  rows={4}
                  placeholder="Describe the problem: what is given, what to find, any constraints..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {/* Sample I/O */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                    Sample Input
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="[2,7,11,15], 9"
                    value={form.sampleInput}
                    onChange={e => setForm(f => ({ ...f, sampleInput: e.target.value }))}
                    style={{ resize: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                    Expected Output
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="[0, 1]"
                    value={form.sampleOutput}
                    onChange={e => setForm(f => ({ ...f, sampleOutput: e.target.value }))}
                    style={{ resize: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              {/* GitHub + Reference */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                    Your GitHub Username
                  </label>
                  <input
                    className="input"
                    placeholder="octocat"
                    value={form.githubUsername}
                    onChange={e => setForm(f => ({ ...f, githubUsername: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>
                    Reference Link <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <input
                    className="input"
                    placeholder="https://leetcode.com/problems/..."
                    value={form.referenceLink}
                    onChange={e => setForm(f => ({ ...f, referenceLink: e.target.value }))}
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: "var(--accent-red)", fontSize: "0.85rem" }}>{error}</p>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: "0.75rem", fontSize: "1rem", marginTop: "0.25rem" }}>
                {submitting ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</> : "✨ Submit Suggestion"}
              </button>
            </form>
          )}
        </div>

        {/* ── RIGHT: GitHub PR Guide ──────────────────────── */}
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            🔧 Contribute via GitHub PR
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Want full credit? Follow this guide to add the problem directly — we'll review and merge your PR!
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: "0.875rem",
                  padding: "0.875rem 1rem",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(47,129,247,0.15)", border: "1px solid rgba(47,129,247,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.85rem", fontWeight: 700,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                      {step.icon} {step.title}
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{step.desc}</p>
                    <pre style={{
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-muted)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.625rem 0.875rem",
                      fontSize: "0.72rem",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "var(--accent-blue)",
                      overflow: "auto",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                    }}>
                      {step.code}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: "1.25rem",
            background: "linear-gradient(135deg, rgba(163,113,247,0.1), rgba(47,129,247,0.1))",
            border: "1px solid rgba(163,113,247,0.25)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            display: "flex", alignItems: "center", gap: "1rem",
          }}>
            <div style={{ fontSize: "2.5rem" }}>⭐</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Ready to contribute?</div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                Contributors get their GitHub handle listed on the problem page permanently.
              </p>
              <a
                href="https://github.com/AkshatG-coder/SyncBoard"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: "0.875rem" }}
              >
                Open GitHub Repo →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
