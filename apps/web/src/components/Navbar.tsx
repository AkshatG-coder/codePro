"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",           label: "Home"       },
  { href: "/contests",   label: "Contests"   },
  { href: "/practice",   label: "Practice"   },
  { href: "/leaderboard",label: "Leaderboard"},
  { href: "/contribute", label: "🤝 Contribute" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav style={{
      background: "rgba(13,17,23,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", height: 60, gap: "2rem" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1.25rem" }}>
          <span style={{
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {"</>"}
          </span>
          <span style={{ color: "var(--text-primary)" }}>CodePro</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "0.25rem", flex: 1 }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "0.375rem 0.875rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: pathname === link.href ? "var(--accent-blue)" : "var(--text-secondary)",
                background: pathname === link.href ? "rgba(47,129,247,0.1)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {session ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--border)" }}
                  />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem", fontWeight: 700, color: "#fff",
                  }}>
                    {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="btn btn-secondary"
                style={{ padding: "0.375rem 0.875rem", fontSize: "0.8rem" }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" style={{ padding: "0.375rem 0.875rem", fontSize: "0.875rem" }}>
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: "0.375rem 0.875rem", fontSize: "0.875rem" }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
