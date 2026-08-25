"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  PROBLEM_STATEMENTS, 
  DOMAIN_COLORS, 
  ProblemStatement 
} from "@/data/problem-statements";
import { 
  Search, 
  X, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Layers, 
  GraduationCap, 
  Copy, 
  Check, 
  ExternalLink,
  Code2,
  Cpu,
  ShieldCheck,
  Globe,
  Bot
} from "lucide-react";
import styles from "./page.module.css";

export default function ProblemStatementsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<"ALL" | "COMMON" | "FIRST_YEAR">("ALL");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedPS, setSelectedPS] = useState<ProblemStatement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Read URL query parameter for preselecting a problem statement (e.g., /problem-statements?id=AG001)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const psId = urlParams.get("id");
      if (psId) {
        const found = PROBLEM_STATEMENTS.find(
          (ps) => ps.id.toLowerCase() === psId.toLowerCase()
        );
        if (found) {
          setSelectedPS(found);
        }
      }
    }
  }, []);

  // Keyboard shortcut to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedPS) {
        setSelectedPS(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPS]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (selectedPS) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPS]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`Copied problem statement ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyShareLink = (id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/problem-statements?id=${id}`;
      navigator.clipboard.writeText(url);
      showToast(`Copied share link for ${id}`);
    }
  };

  // Get distinct domains from all statements
  const domains = useMemo(() => {
    const list = Array.from(new Set(PROBLEM_STATEMENTS.map((ps) => ps.domain)));
    return ["ALL", ...list];
  }, []);

  // Filter statements based on scope, domain, and search query
  const filteredPS = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return PROBLEM_STATEMENTS.filter((ps) => {
      // Scope filter
      if (selectedScope === "COMMON" && ps.isFirstYear) return false;
      if (selectedScope === "FIRST_YEAR" && !ps.isFirstYear) return false;

      // Domain filter
      if (selectedDomain !== "ALL" && ps.domain !== selectedDomain) return false;

      // Search query filter
      if (!q) return true;
      return (
        ps.id.toLowerCase().includes(q) ||
        ps.title.toLowerCase().includes(q) ||
        ps.domain.toLowerCase().includes(q) ||
        ps.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedScope, selectedDomain]);

  // Statistics calculation
  const totalCount = PROBLEM_STATEMENTS.length;
  const commonCount = PROBLEM_STATEMENTS.filter((ps) => !ps.isFirstYear).length;
  const firstYearCount = PROBLEM_STATEMENTS.filter((ps) => ps.isFirstYear).length;

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case "AGENTIC & GENERATIVE AI":
        return <Bot size={15} />;
      case "WEB DEVELOPMENT":
        return <Globe size={15} />;
      case "CYBERSECURITY":
        return <ShieldCheck size={15} />;
      case "COMPUTER VISION & DEEP LEARNING":
        return <Cpu size={15} />;
      case "1ST YEARS":
        return <GraduationCap size={15} />;
      default:
        return <Code2 size={15} />;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.radialGlowTop}></div>
      <div className={styles.radialGlowBottom}></div>

      <div className={styles.container}>
        {/* HERO SECTION */}
        <div className={styles.heroSection}>
          <Link href="/#tracks" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Tracks</span>
          </Link>

          <div>
            <span className={styles.badge}>
              <Sparkles size={14} />
              <span>HACKWAVE 2026 CHALLENGES</span>
            </span>
          </div>

          <h1 className={styles.mainTitle}>
            Problem <span className={styles.gradientText}>Statements</span>
          </h1>

          <p className={styles.subtitle}>
            Explore our curated challenges spanning Agentic AI, Web Development, Cybersecurity, Computer Vision, and specialized 1st-Year challenges. Choose your mission and engineer the future.
          </p>

          {/* STATS SUMMARY */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalCount}</span>
              <span className={styles.statLabel}>Total Statements</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{commonCount}</span>
              <span className={styles.statLabel}>Common / Track Challenges</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{firstYearCount}</span>
              <span className={styles.statLabel}>1st-Year Track Challenges</span>
            </div>
          </div>
        </div>

        {/* CONTROLS & FILTER SECTION */}
        <div className={styles.controlsSection}>
          {/* SEARCH BAR */}
          <div className={styles.searchBoxWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by ID (e.g. AG001, CS002, FY001), keywords, title, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={styles.clearSearchBtn}
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className={styles.filterGroups}>
            {/* SCOPE TABS (ALL / COMMON / 1ST YEAR) */}
            <div className={styles.scopeTabs}>
              <button
                type="button"
                className={`${styles.scopeTab} ${selectedScope === "ALL" ? styles.scopeTabActive : ""}`}
                onClick={() => setSelectedScope("ALL")}
              >
                <Layers size={14} />
                <span>All Challenges ({totalCount})</span>
              </button>
              <button
                type="button"
                className={`${styles.scopeTab} ${selectedScope === "COMMON" ? styles.scopeTabActive : ""}`}
                onClick={() => setSelectedScope("COMMON")}
              >
                <Code2 size={14} />
                <span>Common Tracks ({commonCount})</span>
              </button>
              <button
                type="button"
                className={`${styles.scopeTab} ${selectedScope === "FIRST_YEAR" ? styles.scopeTabActive : ""}`}
                onClick={() => setSelectedScope("FIRST_YEAR")}
              >
                <GraduationCap size={14} />
                <span>🎓 1st-Year Track ({firstYearCount})</span>
              </button>
            </div>

            {/* DOMAIN / TRACK FILTER */}
            <div className={styles.domainTabs}>
              {domains.map((dom) => {
                const isActive = selectedDomain === dom;
                const count = PROBLEM_STATEMENTS.filter((ps) => {
                  if (selectedScope === "COMMON" && ps.isFirstYear) return false;
                  if (selectedScope === "FIRST_YEAR" && !ps.isFirstYear) return false;
                  return dom === "ALL" || ps.domain === dom;
                }).length;

                return (
                  <button
                    key={dom}
                    type="button"
                    className={`${styles.domainTab} ${isActive ? styles.domainTabActive : ""}`}
                    onClick={() => setSelectedDomain(dom)}
                  >
                    {getDomainIcon(dom)}
                    <span>
                      {dom === "ALL" ? "All Domains" : dom} ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className={styles.resultsHeader}>
          <div className={styles.resultsCount}>
            Showing <span className={styles.resultsCountHighlight}>{filteredPS.length}</span> problem statement{filteredPS.length === 1 ? "" : "s"}
          </div>
          {(searchQuery || selectedScope !== "ALL" || selectedDomain !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedScope("ALL");
                setSelectedDomain("ALL");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--flame-red)",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* CARDS GRID */}
        <div className={styles.grid}>
          {filteredPS.length > 0 ? (
            filteredPS.map((ps) => {
              const theme = DOMAIN_COLORS[ps.domain] || {
                badgeBg: "rgba(255,255,255,0.1)",
                badgeText: "#ffffff",
                icon: "#ffffff",
                border: "var(--line)",
              };

              return (
                <div
                  key={ps.id}
                  className={`${styles.card} ${ps.isFirstYear ? styles.cardFirstYear : ""}`}
                  onClick={() => setSelectedPS(ps)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.cardHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        className={styles.psIdBadge}
                        style={{
                          background: theme.badgeBg,
                          color: theme.badgeText,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {ps.id}
                      </span>
                      {ps.isFirstYear ? (
                        <span className={`${styles.trackTypePill} ${styles.pillFirstYear}`}>
                          🎓 1st Year Track
                        </span>
                      ) : (
                        <span className={`${styles.trackTypePill} ${styles.pillCommon}`}>
                          Common Track
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleCopyId(ps.id, e)}
                      title="Copy PS ID"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--line)",
                        color: "var(--ink-60)",
                        borderRadius: "6px",
                        padding: "0.25rem 0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      {copiedId === ps.id ? (
                        <Check size={13} color="#22c55e" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.domainLabel} style={{ color: theme.icon }}>
                      {ps.domain}
                    </div>
                    <h3 className={styles.cardTitle}>{ps.title}</h3>
                    <p className={styles.cardSnippet}>{ps.description}</p>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      type="button"
                      className={styles.viewDetailBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPS(ps);
                      }}
                    >
                      <span>View Full Statement</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Search size={48} />
              </div>
              <h3 className={styles.emptyTitle}>No problem statements found</h3>
              <p className={styles.emptyText}>
                We couldn&apos;t find any statements matching &ldquo;{searchQuery}&rdquo;. Try adjusting your keywords or clearing your filters.
              </p>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedScope("ALL");
                  setSelectedDomain("ALL");
                }}
              >
                Clear Search &amp; Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedPS && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedPS(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                {(() => {
                  const theme = DOMAIN_COLORS[selectedPS.domain] || {
                    badgeBg: "rgba(255,255,255,0.1)",
                    badgeText: "#ffffff",
                    icon: "#ffffff",
                    border: "var(--line)",
                  };
                  return (
                    <>
                      <span
                        className={styles.psIdBadge}
                        style={{
                          background: theme.badgeBg,
                          color: theme.badgeText,
                          border: `1px solid ${theme.border}`,
                          fontSize: "0.95rem",
                          padding: "0.4rem 0.9rem",
                        }}
                      >
                        {selectedPS.id}
                      </span>
                      {selectedPS.isFirstYear ? (
                        <span className={`${styles.trackTypePill} ${styles.pillFirstYear}`}>
                          🎓 1st Year Challenge
                        </span>
                      ) : (
                        <span className={`${styles.trackTypePill} ${styles.pillCommon}`}>
                          Common Challenge
                        </span>
                      )}
                      <span style={{ color: "var(--ink-60)", fontSize: "0.9rem", fontWeight: 600 }}>
                        {selectedPS.domain}
                      </span>
                    </>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPS(null)}
                className={styles.modalCloseBtn}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{selectedPS.title}</h2>
              <div className={styles.modalDescriptionBox}>
                {selectedPS.description}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className={styles.modalFooter}>
              <div className={styles.modalActionsLeft}>
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(selectedPS.id)}
                  className={styles.copyBtn}
                  title="Copy direct link to this statement"
                >
                  <Copy size={14} />
                  <span>Share Statement</span>
                </button>
              </div>

              <div className={styles.modalActionsRight}>
                <Link href="/register" className={styles.registerCta}>
                  <span>Register Team</span>
                  <ArrowRight size={15} />
                </Link>
                <Link href="/login" className={styles.loginCta}>
                  <span>Login to Lock</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className={styles.toast}>
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
