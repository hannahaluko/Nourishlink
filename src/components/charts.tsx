"use client";

import { useId } from "react";
import { dayLetter, monthShort, oneDecimal, parseISO } from "@/lib/format";
import type { GlucoseLog } from "@/lib/types";

/** Blood-glucose trend with the 3.9–7.8 mmol/L target band shaded. */
export function GlucoseChart({
  readings,
  width = 320,
  height = 150,
}: {
  readings: GlucoseLog[];
  width?: number;
  height?: number;
}) {
  const id = useId();
  const ordered = [...readings].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
  );
  if (ordered.length === 0) {
    return <p className="py-6 text-center text-[13px] text-muted">No readings yet.</p>;
  }

  const padY = 14;
  const min = 2.5;
  const max = 13;
  const y = (v: number) => height - padY - ((v - min) / (max - min)) * (height - padY * 2);
  const step = width / Math.max(1, ordered.length - 1);
  const points = ordered.map((r, i) => [i * step, y(r.value)] as const);
  const path = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const bandTop = y(7.8);
  const bandBottom = y(3.9);

  const toneFor = (v: number) =>
    v < 3.9 || v > 10 ? "var(--color-red)" : v > 7.8 ? "var(--color-amber)" : "var(--color-teal)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label="Blood glucose trend with target range"
    >
      <defs>
        <linearGradient id={`gl-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-teal)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* target band */}
      <rect
        x="0"
        y={bandTop}
        width={width}
        height={Math.max(4, bandBottom - bandTop)}
        fill="var(--color-teal-tint)"
        opacity="0.85"
        rx="6"
      />
      <line x1="0" y1={bandTop} x2={width} y2={bandTop} stroke="var(--color-teal)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
      <line x1="0" y1={bandBottom} x2={width} y2={bandBottom} stroke="var(--color-teal)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

      <path d={`${path}`} fill="none" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-red)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="anim-draw"
        style={{ strokeDasharray: 2400, ["--dash-total" as string]: "2400" }}
      />
      {points.map(([px, py], i) => (
        <circle
          key={i}
          cx={px}
          cy={py}
          r={i === points.length - 1 ? 4.6 : 3.4}
          fill="#fff"
          stroke={toneFor(ordered[i].value)}
          strokeWidth="2.2"
        />
      ))}
      <text x={width - 2} y={bandTop - 5} textAnchor="end" className="fill-[#7A7A7A] text-[9px]">
        7.8 upper target
      </text>
    </svg>
  );
}

/** Weekly weight trend. */
export function WeightChart({
  series,
  width = 320,
  height = 140,
}: {
  series: { date: string; kg: number }[];
  width?: number;
  height?: number;
}) {
  const id = useId();
  if (series.length < 2) {
    return <p className="py-6 text-center text-[13px] text-muted">Log two weigh-ins to see a trend.</p>;
  }
  const values = series.map((s) => s.kg);
  const min = Math.min(...values) - 0.6;
  const max = Math.max(...values) + 0.6;
  const padY = 18;
  const step = width / (series.length - 1);
  const y = (v: number) => height - padY - ((v - min) / (max - min)) * (height - padY * 2);
  const points = series.map((s, i) => [i * step, y(s.kg)] as const);
  const path = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const area = `${path} L${width} ${height} L0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Weight trend">
      <defs>
        <linearGradient id={`wg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-lime)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#wg-${id})`} />
      <path
        d={path}
        fill="none"
        stroke="var(--color-lime-dark)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="anim-draw"
        style={{ strokeDasharray: 2400, ["--dash-total" as string]: "2400" }}
      />
      {points.map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r={i === 0 || i === points.length - 1 ? 4.4 : 3} fill="#fff" stroke="var(--color-lime-dark)" strokeWidth="2.2" />
          {(i === 0 || i === points.length - 1) && (
            <text
              x={px}
              y={py - 10}
              textAnchor={i === 0 ? "start" : "end"}
              className="fill-[#111111] text-[10px] font-semibold"
            >
              {oneDecimal(series[i].kg)}
            </text>
          )}
        </g>
      ))}
      <text x="0" y={height - 2} className="fill-[#7A7A7A] text-[9px]">
        {monthShort(series[0].date)} {parseISO(series[0].date).getUTCDate()}
      </text>
      <text x={width} y={height - 2} textAnchor="end" className="fill-[#7A7A7A] text-[9px]">
        {monthShort(series[series.length - 1].date)} {parseISO(series[series.length - 1].date).getUTCDate()}
      </text>
    </svg>
  );
}

/** Seven-day consistency strip — filled dots for days with any log. */
export function ConsistencyStrip({ days }: { days: { date: string; done: boolean }[] }) {
  return (
    <div className="flex items-end justify-between gap-1.5">
      {days.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
          <span
            className={`grid h-9 w-full place-items-center rounded-[10px] text-[11px] font-semibold ${
              d.done ? "bg-lime-tint text-lime-dark" : "bg-canvas text-faint"
            }`}
          >
            {dayLetter(d.date)}
          </span>
        </div>
      ))}
    </div>
  );
}
