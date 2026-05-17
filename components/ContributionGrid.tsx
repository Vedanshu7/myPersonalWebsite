"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { ContributionWeek } from "@/app/api/contributions/route";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface TimeLabel {
  wi: number;
  endWi: number;
  text: string;
}

interface Props {
  weeks: ContributionWeek[];
}

function generateFallbackWeeks(): ContributionWeek[] {
  const weeks: ContributionWeek[] = [];
  for (let w = 0; w < 104; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const seed = ((w * 7 + d) * 2654435761) >>> 0;
      const val = ((seed >>> 16) & 0xff) / 255;
      const count = val < 0.35 ? 0 : val < 0.55 ? 2 : val < 0.75 ? 5 : val < 0.9 ? 8 : 12;
      const level = (count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4) as
        | 0
        | 1
        | 2
        | 3
        | 4;
      days.push({ date: "", count, level });
    }
    weeks.push({ days });
  }
  return weeks;
}

export default function ContributionGrid({ weeks }: Props) {
  const data = useMemo(() => (weeks.length > 0 ? weeks : generateFallbackWeeks()), [weeks]);

  // ── Time labels (built from full dataset) ──
  const [timeLabels, setTimeLabels] = useState<TimeLabel[]>([]);

  useEffect(() => {
    const labels: TimeLabel[] = [];
    let lastMonth = -1;

    data.forEach((week, wi) => {
      let dateStr = week.days.find((d) => d.date)?.date;

      if (!dateStr) {
        const today = new Date();
        const synth = new Date(today);
        synth.setDate(today.getDate() - (data.length - wi) * 7);
        dateStr = synth.toISOString().split("T")[0];
      }

      const date = new Date(dateStr + "T12:00:00");
      const month = date.getMonth();
      const year = date.getFullYear();

      if (month !== lastMonth) {
        labels.push({ wi, endWi: 0, text: `${MONTHS[month]} '${String(year).slice(2)}` });
        lastMonth = month;
      }
    });

    labels.forEach((l, i) => {
      l.endWi = labels[i + 1]?.wi ?? data.length;
    });
    setTimeLabels(labels);
  }, [data]);

  // Reversed for display: newest at top, oldest at bottom
  const reversedLabels = useMemo(() => [...timeLabels].reverse(), [timeLabels]);

  // ── Window state ──
  const [windowTop, setWindowTop] = useState(0);
  const windowTopInitialized = useRef(false);

  useEffect(() => {
    if (timeLabels.length > 0 && !windowTopInitialized.current) {
      windowTopInitialized.current = true;
      setWindowTop(0);
    }
  }, [timeLabels.length]);

  const WIN_SIZE = Math.min(12, timeLabels.length);

  // ── Compute visible data slice from the current dial window ──
  const visibleData = useMemo(() => {
    if (timeLabels.length === 0) return data;
    const visible = reversedLabels.slice(windowTop, windowTop + WIN_SIZE);
    if (visible.length === 0) return data;
    const startWi = Math.min(...visible.map((l) => l.wi));
    const endWi = Math.max(...visible.map((l) => l.endWi));
    return data.slice(startWi, endWi);
  }, [data, timeLabels, reversedLabels, windowTop, WIN_SIZE]);

  // ── Cells and column count derived from visible slice ──
  const cells = useMemo(() => {
    const result: { level: 0 | 1 | 2 | 3 | 4; wi: number; di: number }[] = [];
    visibleData.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        result.push({ level: day.level, wi, di });
      });
    });
    return result;
  }, [visibleData]);

  const numWeeks = visibleData.length;

  // ── Refs for native wheel listener ──
  const [panelHovered, setPanelHovered] = useState(false);
  const wheelAccum = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const timeLabelsRef = useRef<TimeLabel[]>([]);

  useEffect(() => {
    timeLabelsRef.current = timeLabels;
  }, [timeLabels]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const STEP = 80;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const labels = timeLabelsRef.current;
      if (labels.length === 0) return;

      wheelAccum.current += e.deltaY;
      const steps = Math.trunc(wheelAccum.current / STEP);
      if (steps !== 0) {
        wheelAccum.current -= steps * STEP;
        const winSize = Math.min(12, labels.length);
        const max = Math.max(0, labels.length - winSize);
        setWindowTop((prev) => Math.max(0, Math.min(max, prev + steps)));
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handlePanelLeave = () => {
    setPanelHovered(false);
    wheelAccum.current = 0;
  };

  // Range label
  const visibleWindow = reversedLabels.slice(windowTop, windowTop + WIN_SIZE);
  const rangeOldest = visibleWindow[visibleWindow.length - 1]?.text ?? "";
  const rangeNewest = visibleWindow[0]?.text ?? "";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Contribution cells — only the selected year's data */}
      <div className="absolute inset-0" style={{ opacity: 0.28, padding: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${numWeeks}, 1fr)`,
            gridTemplateRows: "repeat(7, 1fr)",
            gridAutoFlow: "column",
            gap: "3px",
            width: "100%",
            height: "100%",
          }}
        >
          {cells.map(({ level, wi, di }) => (
            <div
              key={`${wi}-${di}`}
              style={{
                borderRadius: "3px",
                backgroundColor: `var(--grid-level-${level})`,
                boxShadow: level >= 3 ? `0 0 8px 2px var(--grid-glow-${level})` : "none",
                animationName: level >= 3 ? "contributionPulse" : "none",
                animationDuration: `${2 + (wi % 3)}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
                animationDelay: `${(wi * 0.04 + di * 0.08) % 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(var(--grid-overlay-rgb),0.6) 70%, rgba(var(--grid-overlay-rgb),0.95) 100%)`,
        }}
      />
      {/* Top + bottom fade */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(var(--grid-overlay-rgb),0.55) 0%, transparent 20%, transparent 80%, rgba(var(--grid-overlay-rgb),0.7) 100%)`,
        }}
      />

      {/* Left dial panel */}
      <div
        ref={panelRef}
        className="absolute left-0 top-0 bottom-0"
        style={{ width: "140px", pointerEvents: "auto" }}
        onMouseEnter={() => setPanelHovered(true)}
        onMouseLeave={handlePanelLeave}
      >
        {/* Always-visible range label */}
        {rangeOldest && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              opacity: panelHovered ? 0 : 0.5,
              transition: "opacity 0.35s ease",
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontFamily: "monospace",
                color: "var(--grid-level-3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
              }}
            >
              range
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                color: "var(--grid-level-3)",
                whiteSpace: "nowrap",
              }}
            >
              {rangeOldest} – {rangeNewest}
            </span>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: panelHovered ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        >
          {/* Scroll hint */}
          {timeLabels.length > WIN_SIZE && (
            <div
              style={{
                position: "absolute",
                top: 20,
                left: 20,
                fontSize: 8,
                fontFamily: "monospace",
                color: "var(--grid-level-3)",
                opacity: 0.35,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                zIndex: 1,
              }}
            >
              scroll
            </div>
          )}

          {/* Full-height sliding month list */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <div
              style={{
                transform: `translateY(calc(-${windowTop} * (100vh / ${WIN_SIZE})))`,
                transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {reversedLabels.map((label, i) => {
                const slotIdx = i - windowTop;
                const inView = slotIdx >= 0 && slotIdx < WIN_SIZE;
                const halfWin = Math.max((WIN_SIZE - 1) / 2, 1);
                const dist = inView ? Math.abs(slotIdx - halfWin) / halfWin : 1;
                const opacity = inView ? Math.max(0.25, 1 - dist * 0.6) : 0;
                return (
                  <div
                    key={label.wi}
                    style={{
                      height: `calc(100vh / ${WIN_SIZE})`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "20px",
                      gap: "7px",
                      opacity,
                      transition: "opacity 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        backgroundColor: "var(--grid-level-3)",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "monospace",
                        fontWeight: 500,
                        color: "var(--grid-level-3)",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {label.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Top/bottom fade mask */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `linear-gradient(to bottom,
                rgba(var(--grid-overlay-rgb), 1) 0%,
                rgba(var(--grid-overlay-rgb), 0) 18%,
                rgba(var(--grid-overlay-rgb), 0) 82%,
                rgba(var(--grid-overlay-rgb), 1) 100%)`,
              }}
            />
          </div>

          {/* Range label */}
          {rangeOldest && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                zIndex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontFamily: "monospace",
                  color: "var(--grid-level-3)",
                  opacity: 0.35,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                }}
              >
                range
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  color: "var(--grid-level-3)",
                  opacity: 0.6,
                  whiteSpace: "nowrap",
                }}
              >
                {rangeOldest} – {rangeNewest}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes contributionPulse {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
