"use client";

import Link from "next/link";
import {
  addDays,
  dayLetter,
  dayNumber,
  dayShort,
  num,
  pct,
  prettyDate,
  prettyTime,
  startOfWeek,
  weekDays,
} from "@/lib/format";
import type { DailyMetric, MealLog } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useToast } from "./app-providers";
import {
  BarChart,
  BarSparkline,
  Card,
  CircleButton,
  IconTile,
  LineChart,
  Pill,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  StatTile,
  Value,
  type Tone,
} from "./ui";
import {
  IconArrowRight,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconDroplet,
  IconFlame,
  IconFootsteps,
  IconHeart,
  IconLeaf,
  IconPulse,
  IconScale,
  IconSparkle,
  IconTrend,
  IconVerified,
  IconVideo,
  IconChat,
  IconPlus,
  IconShield,
} from "./icons";

/* ------------------------------ date strip ------------------------------ */

export function DateStrip({
  selected,
  onSelect,
  weekStart,
  onShiftWeek,
  maxWeek,
}: {
  selected: string;
  onSelect: (iso: string) => void;
  weekStart: string;
  onShiftWeek: (delta: number) => void;
  maxWeek?: string;
}) {
  const days = weekDays(weekStart);
  const canGoForward = !maxWeek || weekStart < startOfWeek(maxWeek);

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center justify-between pl-1.5">
        <span className="text-[12px] font-medium text-muted">
          {prettyDate(days[0])} – {prettyDate(days[6])}
        </span>
        <span className="flex items-center gap-2">
          <CircleButton label="Previous week" size={32} onClick={() => onShiftWeek(-1)} className="bg-canvas">
            <IconChevronDown size={16} className="rotate-90" />
          </CircleButton>
          <CircleButton
            label="Next week"
            size={32}
            onClick={() => canGoForward && onShiftWeek(1)}
            className={`bg-canvas ${canGoForward ? "" : "opacity-40"}`}
          >
            <IconChevronDown size={16} className="-rotate-90" />
          </CircleButton>
        </span>
      </div>
      <div className="flex items-stretch justify-between gap-1">
        {days.map((iso) => {
          const active = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-pressed={active}
              className="press flex flex-1 flex-col items-center gap-2 py-1"
            >
              <span className={`text-[11px] font-medium ${active ? "text-lime-dark" : "text-muted"}`}>
                {dayLetter(iso)}
              </span>
              <span
                className={`grid h-10 w-9 place-items-center rounded-full text-[14px] transition-colors duration-150 ${
                  active ? "bg-lime-tint font-bold text-ink" : "font-medium text-ink"
                }`}
              >
                {dayNumber(iso)}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------ hero card ------------------------------ */

export function HeroProgressCard({
  loggedDays,
  targetsMet,
  kcal,
  kcalTarget,
}: {
  loggedDays: number;
  targetsMet: number;
  kcal: number;
  kcalTarget: number;
}) {
  return (
    <Card className="bg-lime-tint p-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-2.5 py-1 text-[12px] font-semibold text-lime-dark">
            <IconSparkle size={14} />
            This week
          </span>
          <h2 className="mt-3 text-[19px] font-bold leading-tight text-ink">Your Weekly Progress</h2>
          <p className="mt-1 text-[13px] text-ink/70">
            {loggedDays} of 7 days logged · {targetsMet}/7 on target
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Pill tone="amber" className="bg-surface/80">
              <IconFlame size={13} />
              {num(kcal)} / {num(kcalTarget)} kcal
            </Pill>
          </div>
        </div>
        <ProgressRing
          value={(loggedDays / 7) * 100}
          label={`${loggedDays}`}
          caption="days"
          size={92}
          thickness={9}
          color="var(--color-lime-dark)"
          track="rgba(255,255,255,0.7)"
        />
      </div>
    </Card>
  );
}

/* --------------------------- weekly chart card --------------------------- */

export function WeeklyBarsCard({
  metrics,
  selected,
  onSelect,
  metric = "steps",
  title,
  href,
}: {
  metrics: DailyMetric[];
  selected: string;
  onSelect: (iso: string) => void;
  metric?: "steps" | "kcal" | "exerciseMin" | "water";
  title: string;
  href?: string;
}) {
  const targetKey = (
    { steps: "stepsTarget", kcal: "kcalTarget", exerciseMin: "exerciseTarget", water: "waterTarget" } as const
  )[metric];

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h2 className="text-[16px] font-semibold">{title}</h2>
          <p className="mt-0.5 text-[12px] text-muted">
            {prettyDate(selected)} · target {num(metrics.find((m) => m.date === selected)?.[targetKey] ?? 0)}
          </p>
        </div>
        {href ? (
          <Link href={href} className="press flex items-center gap-0.5 text-[12px] font-medium text-muted">
            Details
            <IconChevronRight size={15} />
          </Link>
        ) : null}
      </div>
      <BarChart
        data={metrics.map((m) => ({
          key: m.date,
          label: dayLetter(m.date),
          value: m[metric],
          target: m[targetKey],
          highlight: startOfWeek(m.date) === startOfWeek(selected) ? m.date === selected : false,
        }))}
        onSelect={onSelect}
      />
    </Card>
  );
}

/* ------------------------------- stat tiles ------------------------------- */

export function StatGrid({ metric }: { metric: DailyMetric }) {
  const store = useStore();
  const { push } = useToast();
  const weights = store.weightsFor(store.profile.id);
  const delta =
    weights.length > 1 ? weights[weights.length - 1].kg - weights[weights.length - 2].kg : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile
        label="Steps"
        value={num(metric.steps)}
        unit="steps"
        icon={<IconFootsteps size={19} />}
        tone="orange"
        footer={
          <div className="space-y-1.5">
            <ProgressBar value={pct(metric.steps, metric.stepsTarget)} tone="orange" />
            <p className="text-[11px] text-muted">{pct(metric.steps, metric.stepsTarget)}% of {num(metric.stepsTarget)} target</p>
          </div>
        }
      />
      <StatTile
        label="Water"
        value={`${metric.water}`}
        unit={`/ ${metric.waterTarget} glass`}
        icon={<IconDroplet size={19} />}
        tone="blue"
        footer={
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted">{pct(metric.water, metric.waterTarget)}% hydrated</span>
            <button
              type="button"
              onClick={() => {
                store.addWater(1);
                push("Glass of water logged");
              }}
              aria-label="Add a glass of water"
              className="press grid h-8 w-8 place-items-center rounded-full bg-blue-tint text-blue"
            >
              <IconPlus size={16} />
            </button>
          </div>
        }
      />
      <StatTile
        label="Resting heart rate"
        value={`${metric.restingHr}`}
        unit="bpm"
        icon={<IconHeart size={19} />}
        tone="red"
        footer={
          <div className="space-y-1">
            <LineChart values={metric.hrSeries} height={46} />
            <p className="flex items-center gap-1 text-[11px] text-muted">
              <IconPulse size={13} className="text-red" />
              Avg {Math.round(metric.hrSeries.reduce((a, b) => a + b, 0) / metric.hrSeries.length)} bpm today
            </p>
          </div>
        }
      />
      <StatTile
        label="Calories"
        value={num(metric.kcal)}
        unit="Kcal"
        icon={<IconFlame size={19} />}
        tone="amber"
        footer={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-tint px-2 py-1 text-[11px] font-semibold text-amber">
              <IconFlame size={12} />
              {num(Math.max(0, metric.kcalTarget - metric.kcal))} left
            </span>
            <span className="text-[11px] text-muted">of {num(metric.kcalTarget)}</span>
          </div>
        }
      />
      <StatTile
        label="Exercise"
        value={`${metric.exerciseMin}`}
        unit="min"
        icon={<IconTrend size={19} />}
        tone="teal"
        footer={
          <div className="flex items-end justify-between">
            <BarSparkline values={[24, 42, 18, 51, 0, 36, metric.exerciseMin]} />
            <span className="text-[11px] text-muted">target {metric.exerciseTarget}m</span>
          </div>
        }
      />
      <StatTile
        label="Weight"
        value={`${store.profile.weightKg ?? "—"}`}
        unit="kg"
        icon={<IconScale size={19} />}
        tone="orange"
        footer={
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                delta <= 0 ? "bg-teal-tint text-teal" : "bg-red-tint text-red"
              }`}
            >
              {delta <= 0 ? "↓" : "↑"} {Math.abs(delta).toFixed(1)} kg
            </span>
            <span className="text-[11px] text-muted">vs last week</span>
          </div>
        }
      />
    </div>
  );
}

/* -------------------------------- meal rows ------------------------------- */

const MEAL_EMOJI: Record<string, string[]> = {
  Breakfast: ["🥣", "🍌"],
  Lunch: ["🍚", "🐟"],
  Snack: ["🥛", "🍓"],
  Dinner: ["🫘", "🍌"],
};

export function MealRow({
  meal,
  onAdd,
}: {
  meal: MealLog;
  onAdd?: () => void;
}) {
  const emojis = MEAL_EMOJI[meal.type] ?? ["🍽️"];
  return (
    <div className="flex items-center gap-3 py-2.5">
      <IconTile tone={meal.type === "Snack" ? "violet" : "orange"} size={40}>
        <IconFlame size={18} />
      </IconTile>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink">{meal.title}</p>
        <p className="truncate text-[12px] text-muted">
          {meal.type} · {meal.items.join(", ")}
        </p>
      </div>
      <span className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-tint px-2 py-1 text-[11px] font-semibold text-amber">
          <IconFlame size={12} />
          {meal.kcal} kcal
        </span>
        <span className="flex items-center -space-x-2">
          {emojis.map((e, i) => (
            <span
              key={i}
              className="grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-canvas text-[11px]"
            >
              {e}
            </span>
          ))}
        </span>
      </span>
      <CircleButton
        label={`Add to ${meal.title}`}
        size={32}
        onClick={onAdd}
        className="bg-lime-wash text-lime-dark"
      >
        <IconPlus size={16} />
      </CircleButton>
    </div>
  );
}

/* ------------------------------ consult card ------------------------------ */

export function NextConsultCard({
  dietitianName,
  tint,
  date,
  time,
  mode,
  status,
  href,
}: {
  dietitianName: string;
  tint: Tone;
  date: string;
  time: string;
  mode: "video" | "chat";
  status: string;
  href: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <IconTile tone={tint} size={44} shape="circle">
          <IconVerified size={20} />
        </IconTile>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {status === "pending" ? "Awaiting payment" : "Next consult"}
          </p>
          <p className="truncate text-[15px] font-semibold">{dietitianName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
            <IconClock size={13} />
            {prettyDate(date)} · {prettyTime(time)}
            <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-[2px] text-[11px] font-medium capitalize">
              {mode === "video" ? <IconVideo size={11} /> : <IconChat size={11} />}
              {mode}
            </span>
          </p>
        </div>
        <CircleButton label="Open consult" href={href} size={36} className="bg-canvas">
          <IconArrowRight size={18} />
        </CircleButton>
      </div>
    </Card>
  );
}

/* ------------------------------ order tracking ----------------------------- */

const ORDER_STEPS = ["placed", "packed", "dispatched", "delivered"] as const;

export function OrderTrackerCard({
  reference,
  status,
  eta,
  itemCount,
  href,
}: {
  reference: string;
  status: (typeof ORDER_STEPS)[number];
  eta: string;
  itemCount: number;
  href: string;
}) {
  const index = ORDER_STEPS.indexOf(status);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Order in progress</p>
          <p className="text-[15px] font-semibold">{reference}</p>
        </div>
        <Pill tone="teal">
          <IconLeaf size={13} />
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </Pill>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {ORDER_STEPS.map((s, i) => (
          <span key={s} className="flex flex-1 flex-col gap-1.5">
            <span className={`h-1.5 rounded-full ${i <= index ? "bg-lime" : "bg-hatch"}`} />
            <span className={`text-[10px] capitalize ${i <= index ? "font-semibold text-ink" : "text-muted"}`}>
              {s}
            </span>
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[12px] text-muted">
          <IconClock size={13} />
          Arriving {prettyDate(eta.slice(0, 10))}, {prettyTime(eta.slice(11, 16))}
        </p>
        <Link href={href} className="press flex items-center gap-0.5 text-[12px] font-semibold text-lime-dark">
          Track
          <IconChevronRight size={15} />
        </Link>
      </div>
    </Card>
  );
}

/* -------------------------------- reminders ------------------------------- */

export function ReminderList({ limit }: { limit?: number }) {
  const { reminders, profile, toggleReminder, today } = useStore();
  const mine = reminders
    .filter((r) => r.clientId === profile.id)
    .filter((r) => r.when.slice(0, 10) >= today)
    .sort((a, b) => a.when.localeCompare(b.when))
    .slice(0, limit);

  if (!mine.length) return null;

  return (
    <Card className="p-4">
      <SectionHeader title="Reminders" href="/profile" action="Manage" className="mb-1" />
      <ul className="divide-y divide-hairline">
        {mine.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2.5">
            <IconTile
              tone={r.kind === "consult" ? "blue" : r.kind === "order" ? "teal" : "orange"}
              size={38}
            >
              {r.kind === "consult" ? <IconVideo size={18} /> : r.kind === "order" ? <IconLeaf size={18} /> : <IconDroplet size={18} />}
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{r.title}</p>
              <p className="truncate text-[12px] text-muted">{r.detail}</p>
            </div>
            <span className="text-right">
              <span className="block text-[12px] font-semibold">
                {prettyTime(r.when.slice(11, 16))}
              </span>
              <span className="block text-[11px] text-muted">{prettyDate(r.when.slice(0, 10))}</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------------------- privacy note ------------------------------ */

export function ConsentNote({ text, href = "/privacy" }: { text: string; href?: string }) {
  return (
    <Link
      href={href}
      className="press flex items-start gap-3 rounded-[20px] bg-surface p-4 text-left"
    >
      <IconTile tone="gray" size={38}>
        <IconShield size={18} />
      </IconTile>
      <div className="flex-1">
        <p className="text-[13px] font-semibold">Your health data</p>
        <p className="mt-0.5 text-[12px] text-muted">{text}</p>
      </div>
      <IconChevronRight size={18} className="mt-2 text-faint" />
    </Link>
  );
}
