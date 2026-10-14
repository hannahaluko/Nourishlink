"use client";

import { useState } from "react";
import { prettyTime, todayISO } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { GlucoseContext, MealType } from "@/lib/types";
import { useToast } from "./app-providers";
import { Card, IconTile, Sheet } from "./ui";
import { IconCheck, IconDroplet, IconPlus, IconMinus } from "./icons";

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];
const GLUCOSE_CONTEXTS: GlucoseContext[] = ["Fasting", "Pre-meal", "Post-meal", "Bedtime"];

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`press shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium ${
            value === o ? "bg-lime-tint text-ink font-semibold" : "bg-canvas text-muted"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-faint">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-[14px] bg-canvas px-3.5 py-3 text-[14px] font-medium text-ink outline-none placeholder:text-faint focus:ring-2 focus:ring-lime/60";

/* --------------------------------- meal --------------------------------- */

export function LogMealSheet({
  open,
  onClose,
  date = todayISO(),
}: {
  open: boolean;
  onClose: () => void;
  date?: string;
}) {
  const { addMeal } = useStore();
  const { push } = useToast();
  const [type, setType] = useState<MealType>("Breakfast");
  const [title, setTitle] = useState("");
  const [items, setItems] = useState("");
  const [kcal, setKcal] = useState(380);

  const save = () => {
    addMeal({
      date,
      type,
      title: title.trim() || "Home-cooked meal",
      items: items
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      kcal,
    });
    push(`${type} logged · ${kcal} kcal`);
    setTitle("");
    setItems("");
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log a meal"
      footer={
        <button
          type="button"
          onClick={save}
          className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
        >
          Save meal
        </button>
      }
    >
      <div className="space-y-4">
        <Segmented options={MEAL_TYPES} value={type} onChange={setType} />
        <Field label="What did you eat?">
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ofada rice & grilled fish"
          />
        </Field>
        <Field label="Items" hint="Separate with commas so your dietitian sees the detail.">
          <input
            className={inputCls}
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Ofada rice, tilapia, ugu stew"
          />
        </Field>
        <Field label="Estimated calories">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setKcal((k) => Math.max(50, k - 50))}
              aria-label="Decrease calories"
              className="press grid h-11 w-11 place-items-center rounded-full bg-canvas text-ink"
            >
              <IconMinus size={18} />
            </button>
            <span className="flex-1 text-center">
              <span className="tnum text-[24px] font-semibold">{kcal}</span>
              <span className="ml-1 text-[12px] text-muted">kcal</span>
            </span>
            <button
              type="button"
              onClick={() => setKcal((k) => Math.min(2000, k + 50))}
              aria-label="Increase calories"
              className="press grid h-11 w-11 place-items-center rounded-full bg-amber-tint text-amber"
            >
              <IconPlus size={18} />
            </button>
          </div>
        </Field>
      </div>
    </Sheet>
  );
}

/* -------------------------------- glucose -------------------------------- */

export function LogGlucoseSheet({
  open,
  onClose,
  date = todayISO(),
}: {
  open: boolean;
  onClose: () => void;
  date?: string;
}) {
  const { addGlucose } = useStore();
  const { push } = useToast();
  const [value, setValue] = useState(6.4);
  const [context, setContext] = useState<GlucoseContext>("Fasting");
  const [time, setTime] = useState("07:30");
  const [note, setNote] = useState("");

  const tone = value < 3.9 || value > 10 ? "red" : value > 7.8 ? "amber" : "teal";
  const label = value < 3.9 ? "Low" : value > 10 ? "High" : value > 7.8 ? "Above target" : "In range";

  const save = () => {
    addGlucose({ date, time, value, context, note: note.trim() || undefined });
    push(`Glucose ${value.toFixed(1)} mmol/L saved`);
    setNote("");
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log blood glucose"
      footer={
        <button
          type="button"
          onClick={save}
          className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
        >
          Save reading
        </button>
      }
    >
      <div className="space-y-4">
        <Card className="flex items-center justify-between bg-canvas p-4">
          <div>
            <p className="text-[12px] text-muted">Reading</p>
            <span className="flex items-baseline gap-1">
              <span className="tnum text-[40px] font-bold leading-none">{value.toFixed(1)}</span>
              <span className="text-[12px] text-muted">mmol/L</span>
            </span>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
              tone === "teal" ? "bg-teal-tint text-teal" : tone === "amber" ? "bg-amber-tint text-amber" : "bg-red-tint text-red"
            }`}
          >
            {label}
          </span>
        </Card>

        <input
          type="range"
          min={2}
          max={16}
          step={0.1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Glucose value"
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-hatch accent-lime"
        />

        <Field label="When was this taken?">
          <Segmented options={GLUCOSE_CONTEXTS} value={context} onChange={setContext} />
        </Field>
        <Field label="Time">
          <input
            type="time"
            className={inputCls}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Field>
        <Field label="Note (optional)">
          <input
            className={inputCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. after a long walk"
          />
        </Field>
      </div>
    </Sheet>
  );
}

/* --------------------------------- weight -------------------------------- */

export function LogWeightSheet({
  open,
  onClose,
  date = todayISO(),
}: {
  open: boolean;
  onClose: () => void;
  date?: string;
}) {
  const { addWeight, profile, weightsFor } = useStore();
  const { push } = useToast();
  const history = weightsFor(profile.id);
  const last = history.at(-1)?.kg ?? profile.weightKg ?? 80;
  const [kg, setKg] = useState(last);

  const save = () => {
    addWeight({ date, kg: Number(kg.toFixed(1)) });
    push(`Weight ${kg.toFixed(1)} kg saved`);
    onClose();
  };

  const delta = kg - last;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log weight"
      footer={
        <button
          type="button"
          onClick={save}
          className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
        >
          Save weight
        </button>
      }
    >
      <div className="space-y-4">
        <Card className="flex items-center justify-between bg-canvas p-4">
          <div>
            <p className="text-[12px] text-muted">Today&apos;s weight</p>
            <span className="flex items-baseline gap-1">
              <span className="tnum text-[40px] font-bold leading-none">{kg.toFixed(1)}</span>
              <span className="text-[12px] text-muted">kg</span>
            </span>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
              delta <= 0 ? "bg-teal-tint text-teal" : "bg-red-tint text-red"
            }`}
          >
            {delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`}
          </span>
        </Card>
        <input
          type="range"
          min={40}
          max={160}
          step={0.1}
          value={kg}
          onChange={(e) => setKg(Number(e.target.value))}
          aria-label="Weight in kilograms"
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-hatch accent-lime"
        />
        <div className="grid grid-cols-3 gap-2">
          {[-1, -0.5, 0, 0.5, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setKg((v) => Number((v + d).toFixed(1)))}
              className="press rounded-[14px] bg-canvas py-2.5 text-[13px] font-medium text-muted"
            >
              {d > 0 ? `+${d}` : d} kg
            </button>
          ))}
        </div>
        <p className="text-[12px] text-muted">
          Last logged {last.toFixed(1)} kg. Weigh in at the same time of day for the cleanest trend.
        </p>
      </div>
    </Sheet>
  );
}

/* --------------------------------- water --------------------------------- */

export function LogWaterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addWater, metricFor, today } = useStore();
  const { push } = useToast();
  const metric = metricFor(today);
  const [glasses, setGlasses] = useState(1);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log water"
      footer={
        <button
          type="button"
          onClick={() => {
            addWater(glasses);
            push(`${glasses} glass${glasses === 1 ? "" : "es"} of water logged`);
            onClose();
          }}
          className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
        >
          Save {glasses} glass{glasses === 1 ? "" : "es"}
        </button>
      }
    >
      <div className="space-y-4">
        <Card className="flex items-center gap-3 bg-canvas p-4">
          <IconTile tone="blue" size={44}>
            <IconDroplet size={20} />
          </IconTile>
          <div>
            <p className="text-[12px] text-muted">Today so far</p>
            <span className="flex items-baseline gap-1">
              <span className="tnum text-[24px] font-semibold leading-none">{metric.water}</span>
              <span className="text-[12px] text-muted">/ {metric.waterTarget} glasses</span>
            </span>
          </div>
        </Card>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setGlasses((g) => Math.max(1, g - 1))}
            aria-label="Fewer glasses"
            className="press grid h-12 w-12 place-items-center rounded-full bg-canvas"
          >
            <IconMinus size={18} />
          </button>
          <span className="tnum text-[40px] font-bold">{glasses}</span>
          <button
            type="button"
            onClick={() => setGlasses((g) => Math.min(8, g + 1))}
            aria-label="More glasses"
            className="press grid h-12 w-12 place-items-center rounded-full bg-blue-tint text-blue"
          >
            <IconPlus size={18} />
          </button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------ consult chat ------------------------------ */

export function ChatSheet({
  open,
  onClose,
  appointmentId,
}: {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
}) {
  const { appointments, sendMessage, dietitianById } = useStore();
  const appt = appointments.find((a) => a.id === appointmentId);
  const dietitian = appt ? dietitianById(appt.dietitianId) : undefined;
  const [text, setText] = useState("");

  if (!appt) return null;

  const send = () => {
    if (!text.trim()) return;
    sendMessage(appt.id, text.trim(), "client");
    setText("");
  };

  return (
    <Sheet open={open} onClose={onClose} title={`Chat · ${dietitian?.name ?? "Dietitian"}`}>
      <div className="space-y-3">
        <p className="rounded-[16px] bg-canvas p-3 text-[12px] text-muted">
          Messages are part of your shared health record. {dietitian?.name} can see your logs while
          you are an active client.
        </p>
        <ul className="space-y-2.5">
          {appt.thread.length === 0 ? (
            <li className="text-[13px] text-muted">No messages yet — say hello.</li>
          ) : null}
          {appt.thread.map((m) => (
            <li
              key={m.id}
              className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[78%] rounded-[18px] px-3.5 py-2.5 text-[13px] ${
                  m.from === "client" ? "bg-lime-tint text-ink" : "bg-canvas text-ink"
                }`}
              >
                {m.text}
                <span className="mt-1 block text-[10px] text-muted">
                  {prettyTime(m.time.slice(11, 16))}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 pt-1">
          <input
            className={inputCls}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Write a message"
          />
          <button
            type="button"
            onClick={send}
            aria-label="Send message"
            className="press grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime text-white"
          >
            <IconCheck size={20} />
          </button>
        </div>
      </div>
    </Sheet>
  );
}
