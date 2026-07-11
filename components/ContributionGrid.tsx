"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import type { ContributionWeek } from "@/app/api/contributions/route";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Dial geometry: circle center sits off-screen left, labels ride the right half of the rim.
// Radius is half the hero height, so the rim spans the full page top-to-bottom.
const STRIP_W = 140;
const DIAL_R = "50vh";
const DIAL_CX = -40;
const STEP_DEG = 13;
const VISIBLE_DEG = 80;
const WHEEL_STEP = 80;
const DRAG_STEP = 48;
const TOUCH_HIDE_MS = 2500;

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
    const now = new Date();

    data.forEach((week, wi) => {
      let dateStr = week.days.find((d) => d.date)?.date;

      if (!dateStr) {
        const synth = new Date(now);
        synth.setDate(now.getDate() - (data.length - wi) * 7);
        dateStr = synth.toISOString().split("T")[0];
      }

      const date = new Date(dateStr + "T12:00:00");
      const month = date.getMonth();
      const year = date.getFullYear();

      if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())) return;

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

  // Reversed for display: newest first (top of the dial's travel), oldest last
  const reversedLabels = useMemo(() => [...timeLabels].reverse(), [timeLabels]);

  // ── Window state ──
  const [windowTop, setWindowTop] = useState(0);
  const windowTopRef = useRef(0);
  const windowTopInitialized = useRef(false);
  const [bounceDir, setBounceDir] = useState<-1 | 0 | 1>(0);
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeLabels.length > 0 && !windowTopInitialized.current) {
      windowTopInitialized.current = true;
      setWindowTop(0);
    }
  }, [timeLabels.length]);

  const WIN_SIZE = Math.min(12, timeLabels.length);

  // ── Reduced motion ──
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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

  // ── Input handling: wheel + pointer drag share one stepping path ──
  const [panelHovered, setPanelHovered] = useState(false);
  const wheelAccum = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const timeLabelsRef = useRef<TimeLabel[]>([]);
  const dragRef = useRef({ active: false, lastY: 0, accum: 0 });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeLabelsRef.current = timeLabels;
  }, [timeLabels]);

  const applySteps = useCallback((steps: number) => {
    const labels = timeLabelsRef.current;
    if (labels.length === 0 || steps === 0) return;
    const winSize = Math.min(12, labels.length);
    const max = Math.max(0, labels.length - winSize);
    const next = Math.max(0, Math.min(max, windowTopRef.current + steps));
    if (next === windowTopRef.current) {
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
      setBounceDir(steps > 0 ? -1 : 1);
      bounceTimer.current = setTimeout(() => setBounceDir(0), 160);
    } else {
      windowTopRef.current = next;
      setWindowTop(next);
    }
  }, []);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelAccum.current += e.deltaY;
      const steps = Math.trunc(wheelAccum.current / WHEEL_STEP);
      if (steps !== 0) {
        wheelAccum.current -= steps * WHEEL_STEP;
        applySteps(steps);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [applySteps]);

  // Touch has no hover: reveal on contact, hide after a quiet period.
  const touchReveal = useCallback(() => {
    setPanelHovered(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPanelHovered(false), TOUCH_HIDE_MS);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, lastY: e.clientY, accum: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.pointerType !== "mouse") touchReveal();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.accum += e.clientY - d.lastY;
    d.lastY = e.clientY;
    const steps = Math.trunc(d.accum / DRAG_STEP);
    if (steps !== 0) {
      d.accum -= steps * DRAG_STEP;
      // Content follows the finger: dragging down rotates newer months into view.
      applySteps(-steps);
    }
    if (e.pointerType !== "mouse") touchReveal();
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    if (e.pointerType !== "mouse") touchReveal();
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") setPanelHovered(true);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      setPanelHovered(false);
      wheelAccum.current = 0;
      dragRef.current.active = false;
    }
  };

  // Active detent sits at 3 o'clock; the notch points at it.
  const ACTIVE_SLOT = Math.floor(WIN_SIZE / 2);

  // Range label
  const visibleWindow = reversedLabels.slice(windowTop, windowTop + WIN_SIZE);
  const rangeOldest = visibleWindow[visibleWindow.length - 1]?.text ?? "";
  const rangeNewest = visibleWindow[0]?.text ?? "";

  const arcTransition = reducedMotion
    ? "none"
    : "opacity 0.25s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Contribution cells — only the selected window's data */}
      <div className="absolute inset-0" style={{ opacity: 0.5, padding: "24px" }}>
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
                animationName: level >= 3 && !reducedMotion ? "contributionPulse" : "none",
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

      {/* Left dial strip — desktop/tablet only; on phones it would eat ~36% of page-scroll width */}
      <div
        ref={panelRef}
        className="absolute left-0 top-0 bottom-0 hidden sm:block"
        style={{
          width: `${STRIP_W}px`,
          pointerEvents: "auto",
          touchAction: "none",
          userSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
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
              opacity: panelHovered ? 0 : 0.85,
              transition: reducedMotion ? "none" : "opacity 0.35s ease",
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

        {/* The dial — hidden at rest, revealed on hover/touch */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: panelHovered ? 1 : 0,
            transition: reducedMotion ? "none" : "opacity 0.35s ease",
            perspective: "900px",
            perspectiveOrigin: "left center",
          }}
        >
          {/* Tilted dial plane */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateY(-10deg)",
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Backdrop glow */}
            <div
              style={{
                position: "absolute",
                left: `calc(${DIAL_CX}px - ${DIAL_R})`,
                top: `calc(50% - ${DIAL_R})`,
                width: `calc(2 * ${DIAL_R})`,
                height: `calc(2 * ${DIAL_R})`,
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--grid-glow-4) 0%, transparent 68%)",
                opacity: 0.35,
              }}
            />
            {/* Outer rim */}
            <div
              style={{
                position: "absolute",
                left: `calc(${DIAL_CX}px - ${DIAL_R})`,
                top: `calc(50% - ${DIAL_R})`,
                width: `calc(2 * ${DIAL_R})`,
                height: `calc(2 * ${DIAL_R})`,
                borderRadius: "50%",
                border: "1px solid var(--grid-glow-3)",
              }}
            />
            {/* Inner rim */}
            <div
              style={{
                position: "absolute",
                left: `calc(${DIAL_CX}px - ${DIAL_R} + 26px)`,
                top: `calc(50% - ${DIAL_R} + 26px)`,
                width: `calc(2 * ${DIAL_R} - 52px)`,
                height: `calc(2 * ${DIAL_R} - 52px)`,
                borderRadius: "50%",
                border: "1px solid var(--grid-glow-3)",
                opacity: 0.5,
              }}
            />

            {/* Notch pointing at the active detent */}
            <div
              style={{
                position: "absolute",
                left: `calc(${DIAL_CX}px + ${DIAL_R} - 30px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "4px solid transparent",
                borderBottom: "4px solid transparent",
                borderLeft: "6px solid var(--grid-level-3)",
              }}
            />

            {/* Rotor: ticks + labels rotate around the off-screen center */}
            <div
              style={{
                position: "absolute",
                left: DIAL_CX,
                top: "50%",
                width: 0,
                height: 0,
                transform: `rotate(${bounceDir * 3}deg)`,
                transition: reducedMotion
                  ? "none"
                  : bounceDir !== 0
                    ? "transform 0.08s ease-in"
                    : "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transformStyle: "preserve-3d",
              }}
            >
              {reversedLabels.map((label, i) => {
                const slotIdx = i - windowTop;
                const theta = (slotIdx - ACTIVE_SLOT) * STEP_DEG;
                const t = Math.min(Math.abs(theta) / VISIBLE_DEG, 1);
                const inView = slotIdx >= 0 && slotIdx < WIN_SIZE;
                const opacity = inView ? 0.5 + 0.5 * (1 - t) : 0;
                const z = -35 + 90 * Math.cos((t * Math.PI) / 2);
                const scale = Math.max(0.72, 1 - 0.28 * t);
                const isActive = slotIdx === ACTIVE_SLOT;

                return (
                  <div key={label.wi}>
                    {/* Tick on the rim */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: 10,
                        height: 1,
                        backgroundColor: "var(--grid-level-3)",
                        opacity: inView ? (isActive ? 0.9 : 0.25) : 0,
                        transform: `rotate(${theta}deg) translateX(calc(${DIAL_R} - 16px))`,
                        transformOrigin: "0 0",
                        transition: arcTransition,
                      }}
                    />
                    {/* Label riding the arc, counter-rotated to stay horizontal */}
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        fontSize: isActive ? 12 : 10,
                        fontFamily: "monospace",
                        fontWeight: isActive ? 700 : 500,
                        color: "var(--grid-level-3)",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.04em",
                        opacity,
                        transform: `rotate(${theta}deg) translateX(calc(${DIAL_R} + 8px)) rotate(${-theta}deg) translateZ(${z}px) scale(${scale}) translateY(-50%)`,
                        transformOrigin: "0 0",
                        transition: arcTransition,
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {label.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interaction hint */}
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
              }}
            >
              scroll · drag
            </div>
          )}

          {/* Range label (hover state) */}
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
                  opacity: 0.65,
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
                  opacity: 0.9,
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
