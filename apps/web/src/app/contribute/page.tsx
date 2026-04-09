"use client";

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

export default function ContributePage() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: "5rem" }}>
      {/* Hero Section */}
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
            Add your own algorithmic challenges directly to our platform.
            We review every Pull Request and guide you through the process.
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 800, marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
          🔧 How to Contribute via GitHub PR
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: "2.5rem", textAlign: "center" }}>
          Follow this step-by-step guide to add a new problem to the platform.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <div style={{
                display: "flex", alignItems: "flex-start", gap: "1rem",
                padding: "1.25rem",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(47,129,247,0.15)", border: "1px solid rgba(47,129,247,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: 700, color: "var(--accent-blue)"
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                    {step.icon} {step.title}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem", lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                  <pre style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-muted)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.875rem",
                    fontSize: "0.85rem",
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
          marginTop: "2rem",
          background: "linear-gradient(135deg, rgba(163,113,247,0.1), rgba(47,129,247,0.1))",
          border: "1px solid rgba(163,113,247,0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          display: "flex", alignItems: "center", gap: "1.5rem",
        }}>
          <div style={{ fontSize: "3rem" }}>⭐</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.25rem" }}>Ready to contribute?</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1rem" }}>
              Contributors get their GitHub handle listed on the problem page permanently.
            </p>
            <a
              href="https://github.com/AkshatG-coder/codePro"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: "1rem", padding: "0.6rem 1.5rem" }}
            >
              Open GitHub Repo →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
