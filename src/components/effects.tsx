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
            transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1)",
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
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
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
        transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
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

/* Organically morphing ambient blob. Decorative, sits behind content.
   Static SVG on the server / when reduced motion; animates via rAF otherwise. */
const BLOB_STATIC =
  "M 90 50 C 90 72, 72 90, 50 90 C 28 90, 10 72, 10 50 C 10 28, 28 10, 50 10 C 72 10, 90 28, 90 50 Z";

export function MeshBlob({
  color = "var(--accent)",
  secondary = "var(--plum, #7d3a78)",
  size = 600,
  className,
  style,
}: {
  color?: string;
  secondary?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const gradId = useRef(
    `blob-grad-${Math.random().toString(36).slice(2, 9)}`
  ).current;

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let raf = 0;
    const start = performance.now();
    const segs = 8;
    const animate = (now: number) => {
      const t = (now - start) / 1000;
      const pts: [number, number][] = [];
      for (let i = 0; i < segs; i++) {
        const angle = (i / segs) * Math.PI * 2;
        const noise =
          Math.sin(t * 0.5 + i * 1.3) * 0.15 +
          Math.cos(t * 0.7 + i * 2.1) * 0.1;
        const r = 0.85 + noise;
        pts.push([
          50 + Math.cos(angle) * 40 * r,
          50 + Math.sin(angle) * 40 * r,
        ]);
      }
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 0; i < segs; i++) {
        const p0 = pts[(i - 1 + segs) % segs];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % segs];
        const p3 = pts[(i + 2) % segs];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
      }
      d += " Z";
      pathRef.current?.setAttribute("d", d);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={className}
      style={{
        width: size,
        height: size,
        filter: "blur(20px)",
        opacity: 0.55,
        pointerEvents: "none",
        ...style,
      }}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="60%" stopColor={secondary} stopOpacity="0.7" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path ref={pathRef} fill={`url(#${gradId})`} d={BLOB_STATIC} />
    </svg>
  );
}

/* Heading whose weight + tracking tighten as it scrolls through the
   viewport. Renders its class style untouched on the server and when
   reduced motion is requested (no inline override → no hydration shift). */
export function ScrollBoldHeading({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [dyn, setDyn] = useState<CSSProperties | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const center = r.top + r.height / 2;
      const t = 1 - Math.min(1, Math.max(0, center / vh));
      setDyn({
        fontWeight: 400 + Math.round(t * 300),
        letterSpacing: `${-0.02 - t * 0.015}em`,
        transition:
          "font-weight 0.3s ease, letter-spacing 0.3s ease",
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <h2 ref={ref} className={className} style={{ ...style, ...dyn }}>
      {children}
    </h2>
  );
}

/* Small pulsing dot signalling real-time / live data. */
export function LivePulse({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full bg-accent animate-live-pulse motion-reduce:animate-none ${className ?? ""}`}
      style={{
        width: 8,
        height: 8,
        boxShadow: "0 0 8px var(--accent)",
        ...style,
      }}
    />
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
            transition:
              "opacity 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s cubic-bezier(0.22,1,0.36,1)",
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

/* Fade + 12px translateY when the element enters the viewport.
   Server renders content normally; the reveal only runs for elements
   that are below the fold at mount, so above-the-fold content shows
   instantly with no flash. Reduced motion is honoured. */
export function ScrollReveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"initial" | "hidden" | "visible">(
    "initial"
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("visible");
      return;
    }
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    if (r.top < vh) {
      setState("visible");
      return;
    }
    setState("hidden");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setState("visible");
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const dyn: CSSProperties =
    state === "hidden"
      ? {
          opacity: 0,
          transform: "translateY(12px)",
          transition:
            "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
          transitionDelay: `${delay}ms`,
          willChange: "opacity, transform",
        }
      : state === "visible"
        ? {
            opacity: 1,
            transform: "translateY(0)",
            transition:
              "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: `${delay}ms`,
          }
        : {};

  return (
    <div ref={ref} className={className} style={{ ...style, ...dyn }}>
      {children}
    </div>
  );
}

/* Subtle film-grain overlay. Static SVG turbulence noise rendered once
   at the root; pointer-events: none so it never blocks interaction.
   Sits at a low z-index so floating UI (modals, palette) stays above. */
const GRAIN_SVG = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
    "<filter id='n'>" +
    "<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/>" +
    "</filter>" +
    "<rect width='100%' height='100%' filter='url(#n)'/>" +
    "</svg>"
);

export function Grain({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
        backgroundSize: "180px 180px",
        mixBlendMode: "soft-light",
        opacity,
      }}
    />
  );
}
