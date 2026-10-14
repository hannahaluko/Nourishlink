"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { IconChevronRight, IconClose } from "./icons";

/* ------------------------------- tokens ------------------------------- */

export type Tone =
  | "lime"
  | "orange"
  | "blue"
  | "red"
  | "teal"
  | "amber"
  | "violet"
  | "gray";

const TONES: Record<Tone, { tile: string; icon: string; solid: string; wash: string; text: string }> = {
  lime: { tile: "bg-lime-tint", icon: "text-lime-dark", solid: "bg-lime", wash: "bg-lime-wash", text: "text-lime-dark" },
  orange: { tile: "bg-orange-tint", icon: "text-orange", solid: "bg-orange", wash: "bg-orange-tint/60", text: "text-orange" },
  blue: { tile: "bg-blue-tint", icon: "text-blue", solid: "bg-blue", wash: "bg-blue-tint/60", text: "text-blue" },
  red: { tile: "bg-red-tint", icon: "text-red", solid: "bg-red", wash: "bg-red-tint/60", text: "text-red" },
  teal: { tile: "bg-teal-tint", icon: "text-teal", solid: "bg-teal", wash: "bg-teal-tint/60", text: "text-teal" },
  amber: { tile: "bg-amber-tint", icon: "text-amber", solid: "bg-amber", wash: "bg-amber-tint/60", text: "text-amber" },
  violet: { tile: "bg-violet-tint", icon: "text-violet", solid: "bg-violet", wash: "bg-violet-tint/60", text: "text-violet" },
  gray: { tile: "bg-canvas", icon: "text-muted", solid: "bg-ink", wash: "bg-canvas", text: "text-muted" },
};

export const tone = (t: Tone) => TONES[t];

/* ------------------------------ primitives ------------------------------ */

export function Card({
  children,
  className = "",
  as = "div",
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "button" | "link";
  href?: string;
  onClick?: () => void;
}) {
  const cls = `card p-4 ${className}`;
  if (as === "link" && href)
    return (
      <Link href={href} className={`${cls} block press active:scale-[0.985]`}>
        {children}
      </Link>
    );
  if (as === "button")
    return (
      <button type="button" onClick={onClick} className={`${cls} press text-left active:scale-[0.985]`}>
        {children}
      </button>
    );
  return <div className={cls}>{children}</div>;
}

export function IconTile({
  tone: t = "lime",
  size = 40,
  shape = "square",
  children,
  className = "",
}: {
  tone?: Tone;
  size?: number;
  shape?: "square" | "circle";
  children: ReactNode;
  className?: string;
}) {
  const map = TONES[t];
  return (
    <span
      className={`icon-tile shrink-0 ${map.tile} ${map.icon} ${
        shape === "circle" ? "rounded-full" : "rounded-[12px]"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}

/** 44px white circular header action button. */
export function CircleButton({
  children,
  label,
  onClick,
  href,
  variant = "surface",
  size = 44,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "surface" | "lime" | "ghost";
  size?: number;
  className?: string;
}) {
  const styles =
    variant === "lime"
      ? "bg-lime text-white card-float"
      : variant === "ghost"
        ? "bg-transparent text-ink"
        : "bg-surface text-ink";
  const cls = `press inline-flex items-center justify-center rounded-full ${styles} ${className}`;
  const style = { width: size, height: size };
  const inner = <span className="sr-only">{label}</span>;
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls} style={style}>
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls} style={style}>
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone: t = "lime",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const map = TONES[t];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${map.tile} ${map.icon} ${className}`}
    >
      {children}
    </span>
  );
}

export function Tag({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`press rounded-full px-3 py-1.5 text-[13px] font-medium ${
        active ? "bg-ink text-white" : "bg-surface text-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function Value({
  children,
  unit,
  size = "card",
  className = "",
}: {
  children: ReactNode;
  unit?: string;
  size?: "display" | "card";
  className?: string;
}) {
  const sizes = size === "display" ? "text-[40px] leading-[1.05] font-bold" : "text-[24px] leading-none font-semibold";
  return (
    <span className={`flex items-baseline gap-1 ${className}`}>
      <span className={`tnum ${sizes} text-ink`}>{children}</span>
      {unit ? <span className="text-[12px] font-normal text-muted">{unit}</span> : null}
    </span>
  );
}

/** Label top-left, tinted icon tile top-right, big value below (value + unit). */
export function StatTile({
  label,
  value,
  unit,
  icon,
  tone: t = "lime",
  className = "",
  onClick,
  footer,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  tone?: Tone;
  className?: string;
  onClick?: () => void;
  footer?: ReactNode;
}) {
  return (
    <Card as={onClick ? "button" : "div"} onClick={onClick} className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="pt-0.5 text-[13px] font-medium text-muted">{label}</span>
        <IconTile tone={t} size={36}>
          {icon}
        </IconTile>
      </div>
      <div>
        <Value unit={unit}>{value}</Value>
        {footer ? <div className="mt-2">{footer}</div> : null}
      </div>
    </Card>
  );
}

export function SectionHeader({
  title,
  action,
  href,
  className = "",
}: {
  title: string;
  action?: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
      {action ? (
        <Link href={href ?? "#"} className="flex items-center gap-0.5 text-[13px] font-medium text-muted press">
          {action}
          <IconChevronRight size={16} />
        </Link>
      ) : null}
    </div>
  );
}

export function Avatar({
  name,
  size = 44,
  tone: t = "lime",
  src,
}: {
  name: string;
  size?: number;
  tone?: Tone;
  src?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const map = TONES[t];
  if (src)
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${map.tile} ${map.text} text-[14px] font-semibold`}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`press relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-lime" : "bg-hatch"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export function ProgressBar({
  value,
  tone: t = "lime",
  className = "",
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`block h-2 w-full overflow-hidden rounded-full bg-hatch ${className}`}>
      <span
        className={`block h-full rounded-full ${TONES[t].solid} transition-[width] duration-500 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </span>
  );
}

/* --------------------------------- ring --------------------------------- */

export function ProgressRing({
  value,
  label,
  caption,
  size = 84,
  thickness = 8,
  color = "var(--color-lime)",
  track = "var(--color-lime-tint)",
  animate = true,
}: {
  value: number;
  label?: string;
  caption?: string;
  size?: number;
  thickness?: number;
  color?: string;
  track?: string;
  animate?: boolean;
}) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={animate ? "anim-ring" : undefined}
          style={{ ["--dash-total" as string]: `${circumference}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ? <span className="tnum text-[15px] font-bold text-ink">{label}</span> : null}
        {caption ? <span className="text-[10px] font-medium text-muted">{caption}</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------- bar chart ------------------------------- */

export function BarChart({
  data,
  height = 132,
  labelTop = 26,
  className = "",
  showTarget = true,
  onSelect,
  today,
}: {
  data: { key: string; label: string; value: number; target?: number; caption?: string; highlight?: boolean }[];
  height?: number;
  labelTop?: number;
  className?: string;
  showTarget?: boolean;
  onSelect?: (key: string) => void;
  /** ISO date for today — later days render as "not yet logged" instead of 0%. */
  today?: string;
}) {
  const max = Math.max(...data.map((d) => Math.max(d.target ?? 0, d.value, 1)));
  const labelId = useId();

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-2" style={{ height: height + labelTop }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d.value / max) * height);
          const targetH = d.target ? Math.max(6, (d.target / max) * height) : 0;
          const isFuture = today ? d.key > today : false;
          const percent = d.target && !isFuture ? Math.round((d.value / d.target) * 100) : null;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => onSelect?.(d.key)}
              aria-describedby={labelId}
              className="press group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span
                className={`text-[11px] font-semibold ${
                  d.highlight ? "text-lime-dark" : d.value > 0 ? "text-muted" : "text-faint"
                }`}
              >
                {percent === null ? "" : `${percent}%`}
              </span>
              <span className="relative flex w-full items-end justify-center" style={{ height }}>
                {showTarget && targetH > 0 ? (
                  <span
                    className="hatch absolute bottom-0 w-[70%] max-w-[26px] rounded-t-[8px]"
                    style={{ height: targetH }}
                  />
                ) : null}
                <span
                  className={`anim-rise absolute bottom-0 w-[70%] max-w-[26px] rounded-t-[8px] ${
                    d.highlight ? "bg-lime-dark" : "bg-lime-tint"
                  }`}
                  style={{ height: h, animationDelay: `${i * 55}ms` }}
                />
              </span>
              <span
                className={`text-[11px] ${
                  d.highlight ? "font-bold text-ink" : "font-medium text-muted"
                }`}
              >
                {d.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- sparklines ------------------------------ */

export function BarSparkline({
  values,
  height = 34,
  color = "var(--color-lime)",
  highlightLast = true,
}: {
  values: number[];
  height?: number;
  color?: string;
  highlightLast?: boolean;
}) {
  const max = Math.max(...values, 1);
  return (
    <span className="flex items-end gap-[3px]" style={{ height }}>
      {values.map((v, i) => (
        <span
          key={i}
          className="anim-rise w-[6px] rounded-[3px]"
          style={{
            height: Math.max(3, (v / max) * height),
            background:
              i === values.length - 1 && highlightLast ? "var(--color-lime-dark)" : color,
            opacity: v === 0 ? 0.35 : 1,
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </span>
  );
}

export function LineChart({
  values,
  width = 260,
  height = 64,
  color = "var(--color-red)",
  showDots = true,
  className = "",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  className?: string;
}) {
  const id = useId();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - 6 - ((v - min) / span) * (height - 16);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${path} L${width} ${height} L0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${className}`} role="img" aria-label="Heart rate trend">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${id})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="anim-draw"
        style={{ strokeDasharray: 1200, ["--dash-total" as string]: "1200" }}
      />
      {showDots
        ? points.map(([x, y], i) =>
            i === points.length - 1 ? (
              <circle key={i} cx={x} cy={y} r="3.6" fill="#fff" stroke={color} strokeWidth="2.4" />
            ) : null,
          )
        : null}
    </svg>
  );
}

/* --------------------------------- shell --------------------------------- */

export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 px-[18px] pt-4 pb-3">
      {left}
      <div className="min-w-0 flex-1">
        {subtitle ? <p className="truncate text-[13px] font-normal text-muted">{subtitle}</p> : null}
        <h1 className="truncate text-[17px] font-semibold text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}

export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-full flex-col ${className}`}>
      <div className="flex-1 px-[18px] pb-[128px]">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 py-8 text-center">
      <IconTile tone="lime" size={52} shape="circle">
        {icon}
      </IconTile>
      <h3 className="mt-1 text-[16px] font-semibold">{title}</h3>
      <p className="max-w-[260px] text-[13px] text-muted">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </Card>
  );
}

/* ------------------------------ bottom sheet ------------------------------ */

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-ink/25 anim-pop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="anim-sheet relative flex max-h-[88vh] w-full max-w-[460px] flex-col rounded-t-[24px] bg-surface"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <CircleButton label="Close" variant="ghost" size={36} onClick={onClose}>
            <IconClose size={20} />
          </CircleButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer ? <div className="border-t border-hairline px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

/* --------------------------------- motion -------------------------------- */

export function AnimatedNumber({
  value,
  duration = 420,
  format = (n: number) => Math.round(n).toLocaleString(),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <span className="tnum">{format(display)}</span>;
}

export { TONES };
