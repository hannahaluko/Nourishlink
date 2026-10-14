"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { greetingFor } from "@/lib/seed";
import {
  addDays,
  dayLetter,
  num,
  prettyDate,
  startOfWeek,
  weekDays,
} from "@/lib/format";
import { useToast } from "@/components/app-providers";
import {
  ConsentNote,
  DateStrip,
  HeroProgressCard,
  MealRow,
  NextConsultCard,
  OrderTrackerCard,
  ReminderList,
  StatGrid,
} from "@/components/dashboard";
import {
  LogGlucoseSheet,
  LogMealSheet,
  LogWaterSheet,
  LogWeightSheet,
} from "@/components/log-sheets";
import {
  Avatar,
  Card,
  CircleButton,
  IconTile,
  SectionHeader,
  Tag,
} from "@/components/ui";
import {
  IconBell,
  IconCalendar,
  IconChevronRight,
  IconClipboard,
  IconDroplet,
  IconFlame,
  IconPlus,
  IconScale,
  IconVideo,
} from "@/components/icons";

export default function ClientDashboard() {
  const store = useStore();
  const { push } = useToast();
  const {
    profile,
    today,
    mealsFor,
    metricFor,
    appointments,
    dietitianById,
    orders,
    mealPlans,
    consent,
  } = store;

  const [selected, setSelected] = useState(today);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [metric, setMetric] = useState<"steps" | "kcal" | "water" | "exerciseMin">("steps");
  const [sheet, setSheet] = useState<null | "meal" | "glucose" | "weight" | "water">(null);

  const weekMetrics = useMemo(
    () => weekDays(weekStart).map((d) => metricFor(d)),
    [weekStart, metricFor],
  );
  const dayMetric = metricFor(selected);
  const todaysMeals = mealsFor(profile.id, selected);

  const loggedDays = weekMetrics.filter((m) => m.steps > 0 || m.kcal > 0).length;
  const targetsMet = weekMetrics.filter(
    (m) => m.steps >= m.stepsTarget || m.water >= m.waterTarget,
  ).length;

  const upcoming = appointments
    .filter((a) => a.clientId === profile.id && a.date >= today && a.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const activeOrder = orders
    .filter((o) => o.clientId === profile.id && o.status !== "delivered")
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0];
  const plan = mealPlans.find((p) => p.clientId === profile.id);

  const greeting = greetingFor(new Date().getHours());

  const met: { key: "steps" | "kcal" | "water" | "exerciseMin"; label: string; tone: "orange" | "amber" | "blue" | "teal" }[] = [
    { key: "steps", label: "Steps", tone: "orange" },
    { key: "kcal", label: "Calories", tone: "amber" },
    { key: "water", label: "Water", tone: "blue" },
    { key: "exerciseMin", label: "Exercise", tone: "teal" },
  ];

  const quickActions = [
    { label: "Meal", icon: <IconFlame size={19} />, tone: "orange" as const, open: () => setSheet("meal") },
    { label: "Glucose", icon: <IconDroplet size={19} />, tone: "blue" as const, open: () => setSheet("glucose") },
    { label: "Weight", icon: <IconScale size={19} />, tone: "red" as const, open: () => setSheet("weight") },
    { label: "Water", icon: <IconDroplet size={19} />, tone: "teal" as const, open: () => setSheet("water") },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      {/* Header */}
      <header className="flex items-center gap-3 pt-5 pb-4">
        <Avatar name={profile.name} size={46} tone="lime" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-muted">{greeting},</p>
          <h1 className="truncate text-[17px] font-semibold">{profile.name.split(" ")[0]}</h1>
        </div>
        <CircleButton label="Progress calendar" href="/track" size={44}>
          <IconCalendar size={20} />
        </CircleButton>
        <CircleButton label="Notifications" href="/profile" size={44} className="relative">
          <IconBell size={20} />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-lime" />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <HeroProgressCard
          loggedDays={loggedDays}
          targetsMet={targetsMet}
          kcal={dayMetric.kcal}
          kcalTarget={dayMetric.kcalTarget}
        />

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

        {/* Metric switch + chart */}
        <Card className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold">
                {met.find((m) => m.key === metric)?.label} this week
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {prettyDate(selected)} · target{" "}
                {num(
                  metric === "steps"
                    ? dayMetric.stepsTarget
                    : metric === "kcal"
                      ? dayMetric.kcalTarget
                      : metric === "water"
                        ? dayMetric.waterTarget
                        : dayMetric.exerciseTarget,
                )}
              </p>
            </div>
            <Link
              href="/track"
              className="press flex items-center gap-0.5 text-[12px] font-medium text-muted"
            >
              Details
              <IconChevronRight size={15} />
            </Link>
          </div>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {met.map((m) => (
              <Tag key={m.key} active={metric === m.key} onClick={() => setMetric(m.key)}>
                {m.label}
              </Tag>
            ))}
          </div>

          <MiniWeekBars
            metrics={weekMetrics}
            metric={metric}
            selected={selected}
            onSelect={setSelected}
          />
        </Card>

        <StatGrid metric={dayMetric} />

        {/* Quick actions */}
        <Card className="p-4">
          <SectionHeader title="Log something" className="mb-3" />
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.open}
                className="press flex flex-col items-center gap-2"
              >
                <IconTile tone={a.tone} size={52} shape="circle">
                  {a.icon}
                </IconTile>
                <span className="text-[12px] font-medium text-muted">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Meals */}
        <Card className="p-4">
          <SectionHeader
            title={selected === today ? "Today's meals" : `Meals · ${prettyDate(selected)}`}
            action="Log meal"
            href="/track"
            className="mb-1"
          />
          {todaysMeals.length ? (
            <ul className="divide-y divide-hairline">
              {todaysMeals.map((m) => (
                <li key={m.id}>
                  <MealRow
                    meal={m}
                    onAdd={() => {
                      store.addMeal({ ...m, date: today, type: m.type, title: m.title });
                      push(`${m.title} added to today`);
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-[13px] text-muted">
              Nothing logged yet for this day.
            </p>
          )}
          <button
            type="button"
            onClick={() => setSheet("meal")}
            className="press mt-2 flex w-full items-center justify-center gap-2 rounded-[16px] bg-canvas py-3 text-[13px] font-semibold text-lime-dark"
          >
            <IconPlus size={16} />
            Add a meal
          </button>
        </Card>

        {/* Consult */}
        {upcoming ? (
          <NextConsultCard
            dietitianName={dietitianById(upcoming.dietitianId)?.name ?? "Dietitian"}
            tint="lime"
            date={upcoming.date}
            time={upcoming.time}
            mode={upcoming.mode}
            status={upcoming.status}
            href={`/consults/${upcoming.id}`}
          />
        ) : (
          <Card className="flex items-center gap-3 p-4">
            <IconTile tone="blue" size={44} shape="circle">
              <IconVideo size={20} />
            </IconTile>
            <div className="flex-1">
              <p className="text-[15px] font-semibold">No consult booked</p>
              <p className="text-[12px] text-muted">Find a verified dietitian near you.</p>
            </div>
            <CircleButton label="Book a consult" href="/consults/book" size={36} variant="lime">
              <IconPlus size={18} />
            </CircleButton>
          </Card>
        )}

        {/* Meal plan from dietitian */}
        {plan ? (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <IconTile tone="teal" size={44}>
                <IconClipboard size={20} />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Plan from {dietitianById(plan.dietitianId)?.name.split(" ")[0]}
                </p>
                <p className="truncate text-[15px] font-semibold">{plan.title}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {plan.days.length} days · {plan.days.reduce((n, d) => n + d.items.length, 0)} meals
                </p>
              </div>
              <CircleButton label="Open meal plan" href="/meal-plans" size={36} className="bg-canvas">
                <IconChevronRight size={18} />
              </CircleButton>
            </div>
          </Card>
        ) : null}

        {activeOrder ? (
          <OrderTrackerCard
            reference={activeOrder.reference}
            status={activeOrder.status}
            eta={activeOrder.eta}
            itemCount={activeOrder.lines.length}
            href={`/orders/${activeOrder.id}`}
          />
        ) : null}

        <ReminderList limit={3} />

        <ConsentNote
          text={
            consent.shareWithDietitian
              ? "Shared with your booked dietitian only. You can revoke access any time in Profile."
              : "Not shared with any dietitian yet. Turn on sharing in Profile when you book."
          }
        />
      </div>

      <LogMealSheet open={sheet === "meal"} onClose={() => setSheet(null)} date={selected} />
      <LogGlucoseSheet open={sheet === "glucose"} onClose={() => setSheet(null)} date={selected} />
      <LogWeightSheet open={sheet === "weight"} onClose={() => setSheet(null)} date={today} />
      <LogWaterSheet open={sheet === "water"} onClose={() => setSheet(null)} />
    </div>
  );
}

/* ----------------------- compact chart used on the home ----------------------- */

function MiniWeekBars({
  metrics,
  metric,
  selected,
  onSelect,
}: {
  metrics: ReturnType<ReturnType<typeof useStore>["metricFor"]>[];
  metric: "steps" | "kcal" | "water" | "exerciseMin";
  selected: string;
  onSelect: (iso: string) => void;
}) {
  const targetKey = (
    { steps: "stepsTarget", kcal: "kcalTarget", water: "waterTarget", exerciseMin: "exerciseTarget" } as const
  )[metric];
  const max = Math.max(...metrics.map((m) => Math.max(m[metric], m[targetKey])), 1);

  return (
    <div className="flex items-end justify-between gap-2 pt-1">
      {metrics.map((m, i) => {
        const h = Math.max(4, (m[metric] / max) * 112);
        const targetH = Math.max(6, (m[targetKey] / max) * 112);
        const active = m.date === selected;
        const percent = m[targetKey] ? Math.round((m[metric] / m[targetKey]) * 100) : 0;
        return (
          <button
            key={m.date}
            type="button"
            onClick={() => onSelect(m.date)}
            className="press flex flex-1 flex-col items-center gap-1.5"
            aria-label={`${m.date} ${percent}% of target`}
          >
            <span className={`text-[11px] font-semibold ${active ? "text-lime-dark" : "text-muted"}`}>
              {percent}%
            </span>
            <span className="relative flex w-full items-end justify-center" style={{ height: 112 }}>
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
            <span
              className={`text-[11px] ${active ? "font-bold text-ink" : "font-medium text-muted"}`}
            >
              {dayLetter(m.date)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
