"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

function usePointerFine() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setOk(fine && !reduce);
  }, []);
  return ok;
}

/* Animated counter — counts 0 → target on mount; static if reduced motion. */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 1500,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const [n, setN] = useState(value);
  const isFloat = !Number.isInteger(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const display = isFloat
    ? n.toFixed(1)
    : Math.round(n).toLocaleString("ru-RU");
  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* Radial glow that follows the pointer inside a region. */
export function CursorGlow({
  children,
  size = 700,
  intensity = 0.4,
  className,
}: {
  children: ReactNode;
  size?: number;
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999, on: false });
  const enabled = usePointerFine();

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      onMouseMove={
        enabled
          ? (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (!r) return;
              setPos({
                x: e.clientX - r.left,
                y: e.clientY - r.top,
                on: true,
              });
            }
          : undefined
      }
      onMouseLeave={() => setPos((p) => ({ ...p, on: false }))}
    >
      {enabled && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: pos.x - size / 2,
            top: pos.y - size / 2,
            width: size,
            height: size,
            pointerEvents: "none",
            background:
              "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
            opacity: pos.on ? intensity : 0,
            transition: "opacity 0.3s ease",
            mixBlendMode: "screen",
            filter: "blur(20px)",
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

/* 3D tilt-on-hover wrapper. */
export function Tilt({
  children,
  max = 6,
  className,
  style,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const enabled = usePointerFine();

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 1200, ...style }}
      onMouseMove={
        enabled
          ? (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (!r) return;
              const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
              const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
              setT({ x: -dy * max, y: dx * max });
            }
          : undefined
      }
      onMouseLeave={() => setT({ x: 0, y: 0 })}
    >
      <div
        style={{
          height: "100%",
          transform: `rotateX(${t.x}deg) rotateY(${t.y}deg)`,
          transition: "transform 0.2s cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* Element that drifts toward the cursor (magnetic). */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [o, setO] = useState({ x: 0, y: 0 });
  const enabled = usePointerFine();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        display: "inline-flex",
        transform: `translate(${o.x}px, ${o.y}px)`,
        transition: "transform 0.2s cubic-bezier(0.2,0.8,0.2,1)",
      }}
      onMouseMove={
        enabled
          ? (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (!r) return;
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              setO({
                x: (e.clientX - cx) * strength,
                y: (e.clientY - cy) * strength,
              });
            }
          : undefined
      }
      onMouseLeave={() => setO({ x: 0, y: 0 })}
    >
      {children}
    </div>
  );
}

/* Custom magenta pill cursor while hovering a region. */
export function HoverCursor({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, on: false });
  const enabled = usePointerFine();

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", cursor: pos.on ? "none" : undefined }}
      onMouseMove={
        enabled
          ? (e) => {
              const r = ref.current?.getBoundingClientRect();
              if (!r) return;
              setPos({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
            }
          : undefined
      }
      onMouseLeave={() => setPos((p) => ({ ...p, on: false }))}
    >
      {children}
      {enabled && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y,
            pointerEvents: "none",
            transform: `translate(-50%,-50%) scale(${pos.on ? 1 : 0.4})`,
            opacity: pos.on ? 1 : 0,
            transition: "opacity 0.2s ease, transform 0.2s ease",
            background: "var(--accent)",
            color: "var(--on-accent)",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
            zIndex: 50,
            boxShadow: "var(--glow)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
