"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { bmi, bmiLabel, oneDecimal, prettyDate } from "@/lib/format";
import { Card, CircleButton, IconTile, Pill, ProgressBar, StatTile, Value } from "@/components/ui";
import { WeightChart } from "@/components/charts";
import { LogWeightSheet } from "@/components/log-sheets";
import { IconBack, IconPlus, IconScale, IconTrend, IconSparkle } from "@/components/icons";

export default function WeightPage() {
  const store = useStore();
  const router = useRouter();
  const { profile, today, weightsFor } = store;
  const [open, setOpen] = useState(false);
  const weights = weightsFor(profile.id);
  const first = weights[0];
  const latest = weights.at(-1);
  const lost = first && latest ? first.kg - latest.kg : 0;
  const value = bmi(profile.weightKg, profile.heightCm);

  const goalWeight = 68;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Weight log</p>
          <h1 className="truncate text-[17px] font-semibold">Weight trend</h1>
        </div>
        <CircleButton label="Log weight" size={44} variant="lime" onClick={() => setOpen(true)}>
          <IconPlus size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] text-muted">Current weight</p>
              <Value size="display" unit="kg">
                {latest ? oneDecimal(latest.kg) : "—"}
              </Value>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Pill tone={lost >= 0 ? "teal" : "red"}>
                  <IconTrend size={13} />
                  {lost >= 0 ? "−" : "+"}
                  {oneDecimal(Math.abs(lost))} kg since start
                </Pill>
                {value ? <Pill tone="gray">BMI {oneDecimal(value)} · {bmiLabel(value)}</Pill> : null}
              </div>
            </div>
            <IconTile tone="orange" size={44}>
              <IconScale size={20} />
            </IconTile>
          </div>
          <div className="mt-4">
            <WeightChart series={weights} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold">Progress to goal</h2>
              <p className="mt-0.5 text-[12px] text-muted">
                Target {goalWeight} kg · {oneDecimal(Math.max(0, (latest?.kg ?? 0) - goalWeight))} kg to go
              </p>
            </div>
            <IconTile tone="lime" size={40}>
              <IconSparkle size={19} />
            </IconTile>
          </div>
          <div className="mt-3 space-y-2">
            <ProgressBar
              value={
                first && latest
                  ? Math.max(0, Math.min(100, ((first.kg - latest.kg) / (first.kg - goalWeight)) * 100))
                  : 0
              }
            />
            <div className="flex justify-between text-[11px] text-muted">
              <span>Start {first ? oneDecimal(first.kg) : "—"} kg</span>
              <span>Goal {goalWeight} kg</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Height"
            value={`${profile.heightCm ?? "—"}`}
            unit="cm"
            icon={<IconScale size={19} />}
            tone="violet"
          />
          <StatTile
            label="Weigh-ins"
            value={`${weights.length}`}
            unit="logged"
            icon={<IconTrend size={19} />}
            tone="blue"
          />
        </div>

        <Card className="p-4">
          <h2 className="mb-1 text-[16px] font-semibold">History</h2>
          <ul className="divide-y divide-hairline">
            {[...weights].reverse().map((w, i) => {
              const prev = [...weights].reverse()[i + 1];
              const delta = prev ? w.kg - prev.kg : 0;
              return (
                <li key={w.date} className="flex items-center gap-3 py-3">
                  <IconTile tone="orange" size={38}>
                    <IconScale size={18} />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold">{oneDecimal(w.kg)} kg</p>
                    <p className="text-[12px] text-muted">{prettyDate(w.date)}</p>
                  </div>
                  {prev ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        delta <= 0 ? "bg-teal-tint text-teal" : "bg-red-tint text-red"
                      }`}
                    >
                      {delta <= 0 ? "−" : "+"}
                      {oneDecimal(Math.abs(delta))} kg
                    </span>
                  ) : (
                    <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-muted">
                      Start
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <p className="px-1 text-[11px] text-muted">
          Weigh yourself at the same time each week — first thing in the morning, before eating — for the
          cleanest trend. Last weigh-in {latest ? prettyDate(latest.date) : "—"}.
        </p>
      </div>

      <LogWeightSheet open={open} onClose={() => setOpen(false)} date={today} />
    </div>
  );
}
