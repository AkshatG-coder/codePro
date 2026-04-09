"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";

// Monaco must be dynamically loaded (no SSR)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface TestCaseResult {
  id: string;
  status: string;
  time: number | null;
  memory: number | null;
  stderr: string | null;
  compileOutput: string | null;
  testCase: { isHidden: boolean; input: string; expectedOutput: string };
}

interface SubmissionStatus {
  id: string;
  status: string;
  time: number | null;
  memory: number | null;
  languageId: number;
  createdAt: string;
  submissionTestCases: TestCaseResult[];
}

const LANGUAGES = [
  { id: 54,  label: "C++ (G++ 9.2)", monacoId: "cpp"        },
  { id: 63,  label: "JavaScript",    monacoId: "javascript"  },
  { id: 73,  label: "Rust",          monacoId: "rust"        },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "...",  color: "var(--text-muted)",    bg: "var(--bg-elevated)" },
  AC:      { label: "✓",   color: "var(--accent-green)",  bg: "rgba(63,185,80,0.2)"  },
  WA:      { label: "✗",   color: "var(--accent-red)",    bg: "rgba(248,81,73,0.2)"  },
  TLE:     { label: "TLE", color: "var(--accent-purple)", bg: "rgba(163,113,247,0.2)"},
  MLE:     { label: "MLE", color: "var(--accent-purple)", bg: "rgba(163,113,247,0.2)"},
  CE:      { label: "CE",  color: "var(--accent-orange)", bg: "rgba(227,179,65,0.2)" },
  RE:      { label: "RE",  color: "var(--accent-red)",    bg: "rgba(248,81,73,0.15)" },
  SE:      { label: "SE",  color: "var(--text-muted)",    bg: "var(--bg-elevated)"   },
};

interface Props {
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    defaultCodes: { languageId: number; code: string }[];
  };
  contestId?: string;
}

export default function ProblemIDE({ problem, contestId }: Props) {
  const { data: session } = useSession();

  const [tab, setTab]               = useState<"problem" | "submissions">("problem");
  const [langId, setLangId]         = useState(54);
  const [code, setCode]             = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSub, setCurrentSub] = useState<SubmissionStatus | null>(null);
  const [pastSubs, setPastSubs]     = useState<SubmissionStatus[]>([]);
  const [error, setError]           = useState<string | null>(null);

  // Set default code when language changes
  useEffect(() => {
    const defaultCode = problem.defaultCodes.find(d => d.languageId === langId);
    setCode(defaultCode?.code ?? "// Write your solution here");
  }, [langId, problem.defaultCodes]);

  const currentLang = LANGUAGES.find(l => l.id === langId)!;

  // ── Polling ───────────────────────────────────────────────────
  const pollStatus = useCallback(async (submissionId: string, attempts = 0) => {
    if (attempts >= 12) return; // max ~30 seconds
    try {
      const res = await fetch(`/api/submission/${submissionId}/status`);
      const data = await res.json();
      if (!data.success) return;

      setCurrentSub(data.data);

      if (data.data.status === "PENDING") {
        setTimeout(() => pollStatus(submissionId, attempts + 1), 2500);
      }
    } catch {
      setTimeout(() => pollStatus(submissionId, attempts + 1), 3000);
    }
  }, []);

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!session) { setError("Please sign in to submit."); return; }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setCurrentSub(null);
    setTab("problem");

    try {
      const res = await fetch("/api/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, contestId, code, languageId: langId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); return; }

      const { submissionId } = data;
      // Optimistic pending state
      setCurrentSub({
        id: submissionId,
        status: "PENDING",
        time: null,
        memory: null,
        languageId: langId,
        createdAt: new Date().toISOString(),
        submissionTestCases: [],
      });
      pollStatus(submissionId);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>

      {/* ── LEFT PANE ──────────────────────────────────────── */}
      <div style={{
        width: "45%",
        minWidth: 340,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}>
        {/* Problem header */}
        <div style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <h1 style={{ fontSize: "1rem", fontWeight: 700, flex: 1 }}>{problem.title}</h1>
          <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          {["problem", "submissions"].map(t => (
            <button key={t} onClick={() => setTab(t as any)} style={{
              padding: "0.625rem 1.25rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: tab === t ? "var(--accent-blue)" : "var(--text-muted)",
              borderBottom: tab === t ? "2px solid var(--accent-blue)" : "2px solid transparent",
              transition: "all 0.15s",
              textTransform: "capitalize",
            }}>
              {t === "problem" ? "📄 Problem" : "📊 Submissions"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {tab === "problem" ? (
            <>
              {/* Current submission result */}
              {currentSub && <SubmissionResult sub={currentSub} />}

              {/* Problem description */}
              <div className="prose">
                <ReactMarkdown>{problem.description}</ReactMarkdown>
              </div>
            </>
          ) : (
            <SubmissionsList subs={pastSubs} />
          )}
        </div>
      </div>

      {/* ── RIGHT PANE ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Editor toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.625rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
        }}>
          <select
            id="language-select"
            value={langId}
            onChange={e => setLangId(Number(e.target.value))}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              padding: "0.375rem 0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          {error && (
            <span style={{ fontSize: "0.8rem", color: "var(--accent-red)" }}>{error}</span>
          )}

          <button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-success"
            style={{ padding: "0.5rem 1.5rem", opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Submitting...</> : "▶ Submit"}
          </button>
        </div>

        {/* Monaco Editor */}
        <div style={{ flex: 1 }}>
          <MonacoEditor
            height="100%"
            language={currentLang.monacoId}
            value={code}
            onChange={v => setCode(v ?? "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              lineNumbers: "on",
              renderLineHighlight: "line",
              bracketPairColorization: { enabled: true },
              padding: { top: 12 },
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Submission Result Component ────────────────────────────────────
function SubmissionResult({ sub }: { status?: string; sub: SubmissionStatus }) {
  const allDone = sub.submissionTestCases.length > 0 && sub.submissionTestCases.every(tc => tc.status !== "PENDING");
  const statusMeta = STATUS_META[sub.status] ?? STATUS_META.PENDING;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "1rem",
      marginBottom: "1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <span style={{
          fontWeight: 700,
          fontSize: "0.9rem",
          color: statusMeta.color,
        }}>
          {sub.status === "PENDING" ? (
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="spinner" /> Judging...
            </span>
          ) : sub.status}
        </span>
        {sub.time && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {(sub.time * 1000).toFixed(0)}ms · {sub.memory?.toFixed(1)}MB
          </span>
        )}
      </div>

      {/* Test case blocks */}
      {sub.submissionTestCases.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {sub.submissionTestCases.map((tc, i) => {
            const meta = STATUS_META[tc.status] ?? STATUS_META.PENDING;
            return (
              <div
                key={tc.id}
                title={`Test ${i + 1}: ${tc.status}`}
                style={{
                  width: 32, height: 32,
                  borderRadius: 6,
                  background: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 700,
                  transition: "all 0.3s",
                  animation: tc.status !== "PENDING" ? "fadeUp 0.3s ease" : undefined,
                }}
              >
                {meta.label}
              </div>
            );
          })}
        </div>
      )}

      {/* CE / RE details */}
      {allDone && sub.submissionTestCases[0]?.compileOutput && (
        <pre style={{
          marginTop: "0.75rem",
          background: "var(--bg-elevated)",
          padding: "0.75rem",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.75rem",
          color: "var(--accent-orange)",
          overflow: "auto",
          maxHeight: 120,
        }}>
          {sub.submissionTestCases[0].compileOutput}
        </pre>
      )}
    </div>
  );
}

function SubmissionsList({ subs }: { subs: SubmissionStatus[] }) {
  if (!subs.length) return (
    <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>
      No submissions yet. Submit your solution!
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {subs.map(s => {
        const meta = STATUS_META[s.status] ?? STATUS_META.PENDING;
        return (
          <div key={s.id} style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            display: "flex", alignItems: "center", gap: "1rem",
          }}>
            <span style={{ fontWeight: 700, color: meta.color, minWidth: 60 }}>{s.status}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {LANGUAGES.find(l => l.id === s.languageId)?.label}
            </span>
            {s.time && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{(s.time * 1000).toFixed(0)}ms</span>}
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "auto" }}>
              {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
