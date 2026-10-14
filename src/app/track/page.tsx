"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  addDays,
  dayLetter,
  dayShort,
  glucoseStatus,
  num,
  oneDecimal,
  pct,
  prettyDate,
  startOfWeek,
  weekDays,
} from "@/lib/format";
import {
  BarSparkline,
  Card,
  CircleButton,
  IconTile,
  Pill,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  Tag,
  Value,
} from "@/components/ui";
import { DateStrip, MealRow, StatGrid } from "@/components/dashboard";
import { LogGlucoseSheet, LogMealSheet, LogWeightSheet } from "@/components/log-sheets";
import { ConsistencyStrip, GlucoseChart, WeightChart } from "@/components/charts";
import {
  IconBack,
  IconBell,
  IconChevronRight,
  IconDroplet,
  IconFootsteps,
  IconPlus,
  IconScale,
  IconTrend,
} from "@/components/icons";
import { useRouter } from "next/navigation";

type MetricKey = "steps" | "kcal" | "water" | "exerciseMin";

export default function TrackPage() {
  const store = useStore();
  const router = useRouter();
  const { profile, today, metricFor, mealsFor, glucoseFor, weightsFor } = store;
  const [selected, setSelected] = useState(today);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [metric, setMetric] = useState<MetricKey>("steps");
  const [sheet, setSheet] = useState<null | "meal" | "glucose" | "weight">(null);

  const weekMetrics = useMemo(
    () => weekDays(weekStart).map((d) => metricFor(d)),
    [weekStart, metricFor],
  );
  const day = metricFor(selected);
  const meals = mealsFor(profile.id, selected);
  const glucose = glucoseFor(profile.id);
  const weights = weightsFor(profile.id);
  const latestGlucose = glucose[0];
  const latestWeight = weights.at(-1);

  const inRange = glucose.filter((g) => glucoseStatus(g.value).tone === "good").length;
  const metricChips: { key: MetricKey; label: string; target: number; value: number; unit: string }[] = [
    { key: "steps", label: "Steps", target: day.stepsTarget, value: day.steps, unit: "steps" },
    { key: "kcal", label: "Calories", target: day.kcalTarget, value: day.kcal, unit: "kcal" },
    { key: "water", label: "Water", target: day.waterTarget, value: day.water, unit: "glasses" },
    { key: "exerciseMin", label: "Exercise", target: day.exerciseTarget, value: day.exerciseMin, unit: "min" },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Health & diet tracking</p>
          <h1 className="truncate text-[17px] font-semibold">Your weekly progress</h1>
        </div>
        <CircleButton label="Reminders" href="/profile" size={44}>
          <IconBell size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        {/* Ring summary */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={pct(day.steps, day.stepsTarget)}
              label={`${pct(day.steps, day.stepsTarget)}%`}
              caption="steps"
              size={96}
              thickness={10}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-muted">{prettyDate(selected)} overall</p>
              <Value size="display" unit="kcal">
                {num(day.kcal)}
              </Value>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Pill tone="teal">
                  <IconFootsteps size={13} />
                  {num(day.steps)} steps
                </Pill>
                <Pill tone="blue">
                  <IconDroplet size={13} />
                  {day.water} glasses
                </Pill>
              </div>
            </div>
          </div>
        </Card>

        <DateStrip
          selected={selected}
          onSelect={setSelected}
          weekStart={weekStart}
          onShiftWeek={(d) => {
            setWeekStart((w) => addDays(w, d * 7));
            setSelected((s) => addDays(s, d * 7));
          }}
          maxWeek={today}
        />

        {/* Metric bars */}
        <Card className="p-4">
          <SectionHeader
            title={`${metricChips.find((m) => m.key === metric)?.label} per day`}
            className="mb-2"
          />
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {metricChips.map((m) => (
              <Tag key={m.key} active={metric === m.key} onClick={() => setMetric(m.key)}>
                {m.label}
              </Tag>
            ))}
          </div>
          <MetricBars
            data={weekMetrics.map((m) => ({
              date: m.date,
              value: m[metric],
              target: metricChips.find((c) => c.key === metric)?.target ?? 1,
            }))}
            selected={selected}
            onSelect={setSelected}
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {metricChips.map((m) => (
              <div key={m.key} className="rounded-[16px] bg-canvas p-3">
                <p className="text-[11px] text-muted">{m.label}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="tnum text-[18px] font-semibold">{num(m.value)}</span>
                  <span className="text-[11px] text-muted">
                    / {num(m.target)} {m.unit}
                  </span>
                </div>
                <ProgressBar
                  className="mt-2"
                  value={pct(m.value, m.target)}
                  tone={m.key === "steps" ? "orange" : m.key === "kcal" ? "amber" : m.key === "water" ? "blue" : "teal"}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Logging consistency */}
        <Card className="p-4">
          <SectionHeader title="Logging streak" className="mb-3" />
          <ConsistencyStrip
            days={weekMetrics.map((m) => ({ date: m.date, done: m.steps > 0 || m.kcal > 0 }))}
          />
          <p className="mt-3 text-[12px] text-muted">
            You logged on {weekMetrics.filter((m) => m.steps > 0 || m.kcal > 0).length} of 7 days.
            Reminders go out at 7pm when a day is empty.
          </p>
        </Card>

        {/* Glucose */}
        <Card className="p-4">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold">Blood glucose</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {glucose.length} readings · {Math.round((inRange / Math.max(1, glucose.length)) * 100)}% in range
              </p>
            </div>
            <Link href="/track/glucose" className="press flex items-center gap-0.5 text-[12px] font-medium text-muted">
              All readings
              <IconChevronRight size={15} />
            </Link>
          </div>
          <GlucoseChart readings={glucose.slice(0, 10)} />
          <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-canvas p-3">
            <IconTile tone="red" size={40}>
              <IconDroplet size={18} />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-muted">Latest · {latestGlucose?.context}</p>
              <Value unit="mmol/L">{latestGlucose ? oneDecimal(latestGlucose.value) : "—"}</Value>
            </div>
            <CircleButton label="Log glucose" size={36} variant="lime" onClick={() => setSheet("glucose")}>
              <IconPlus size={18} />
            </CircleButton>
          </div>
        </Card>

        {/* Weight */}
        <Card className="p-4">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold">Weight</h2>
              <p className="mt-0.5 text-[12px] text-muted">Weekly weigh-ins since you joined</p>
            </div>
            <Link href="/track/weight" className="press flex items-center gap-0.5 text-[12px] font-medium text-muted">
              History
              <IconChevronRight size={15} />
            </Link>
          </div>
          <WeightChart series={weights} />
          <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-canvas p-3">
            <IconTile tone="orange" size={40}>
              <IconScale size={18} />
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-muted">
                Current · {latestWeight ? prettyDate(latestWeight.date) : "no weigh-in"}
              </p>
              <Value unit="kg">{latestWeight ? oneDecimal(latestWeight.kg) : "—"}</Value>
            </div>
            <CircleButton label="Log weight" size={36} variant="lime" onClick={() => setSheet("weight")}>
              <IconPlus size={18} />
            </CircleButton>
          </div>
        </Card>

        <StatGrid metric={day} />

        {/* Meals for the day */}
        <Card className="p-4">
          <SectionHeader
            title={`Meals · ${prettyDate(selected)}`}
            action="Add"
            href="#"
            className="mb-1"
          />
          {meals.length ? (
            <ul className="divide-y divide-hairline">
              {meals.map((m) => (
                <li key={m.id}>
                  <MealRow meal={m} onAdd={() => setSheet("meal")} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-[13px] text-muted">No meals logged for this day.</p>
          )}
          <button
            type="button"
            onClick={() => setSheet("meal")}
            className="press mt-2 flex w-full items-center justify-center gap-2 rounded-[16px] bg-canvas py-3 text-[13px] font-semibold text-lime-dark"
          >
            <IconPlus size={16} />
            Log a meal
          </button>
        </Card>

        {/* Weekly exercise sparkline card */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold">Exercise this week</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {weekMetrics.reduce((n, m) => n + m.exerciseMin, 0)} minutes across{" "}
                {weekMetrics.filter((m) => m.exerciseMin > 0).length} days
              </p>
            </div>
            <IconTile tone="teal" size={40}>
              <IconTrend size={19} />
            </IconTile>
          </div>
          <div className="mt-4">
            <BarSparkline values={weekMetrics.map((m) => m.exerciseMin)} height={56} />
            <div className="mt-2 flex justify-between">
              {weekMetrics.map((m) => (
                <span key={m.date} className="text-[10px] text-muted">
                  {dayLetter(m.date)}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <LogMealSheet open={sheet === "meal"} onClose={() => setSheet(null)} date={selected} />
      <LogGlucoseSheet open={sheet === "glucose"} onClose={() => setSheet(null)} date={selected} />
      <LogWeightSheet open={sheet === "weight"} onClose={() => setSheet(null)} date={today} />
    </div>
  );
}

function MetricBars({
  data,
  selected,
  onSelect,
}: {
  data: { date: string; value: number; target: number }[];
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.target)), 1);
  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * 118);
        const targetH = Math.max(6, (d.target / max) * 118);
        const active = d.date === selected;
        const percent = Math.round((d.value / d.target) * 100);
        return (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelect(d.date)}
            className="press flex flex-1 flex-col items-center gap-1.5"
            aria-label={`${dayShort(d.date)} ${percent}% of target`}
          >
            <span className={`text-[11px] font-semibold ${active ? "text-lime-dark" : "text-muted"}`}>
              {percent}%
            </span>
            <span className="relative flex w-full items-end justify-center" style={{ height: 118 }}>
              <span
                className="hatch absolute bottom-0 w-[70%] max-w-[24px] rounded-t-[8px]"
                style={{ height: targetH }}
              />
              <span
                className={`anim-rise absolute bottom-0 w-[70%] max-w-[24px] rounded-t-[8px] ${
                  active ? "bg-lime-dark" : "bg-lime-tint"
                }`}
                style={{ height: h, animationDelay: `${i * 55}ms` }}
              />
            </span>
            <span className={`text-[11px] ${active ? "font-bold text-ink" : "font-medium text-muted"}`}>
              {dayLetter(d.date)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

