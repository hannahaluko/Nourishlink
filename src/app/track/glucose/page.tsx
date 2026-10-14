"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { glucoseStatus, lastNDays, oneDecimal, prettyDate, prettyTime } from "@/lib/format";
import { averageOf, glucoseInRangeRatio } from "@/lib/care";
import { Card, CircleButton, IconTile, Pill, StatTile, Value } from "@/components/ui";
import { GlucoseChart } from "@/components/charts";
import { LogGlucoseSheet } from "@/components/log-sheets";
import {
  IconBack,
  IconDroplet,
  IconPlus,
  IconTrend,
  IconClipboard,
} from "@/components/icons";

export default function GlucosePage() {
  const store = useStore();
  const router = useRouter();
  const { profile, today, glucoseFor, notes, dietitianById } = store;
  const [open, setOpen] = useState(false);
  const readings = glucoseFor(profile.id);

  const last14 = lastNDays(today, 14);
  const fasting = readings.filter((r) => r.context === "Fasting");
  const avgFasting = averageOf(fasting.map((r) => r.value));
  const inRangeRatio = glucoseInRangeRatio(readings);
  const note = notes.find((n) => n.clientId === profile.id);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Blood glucose log</p>
          <h1 className="truncate text-[17px] font-semibold">Glucose trends</h1>
        </div>
        <CircleButton label="Log glucose" size={44} variant="lime" onClick={() => setOpen(true)}>
          <IconPlus size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] text-muted">Average fasting (7 days)</p>
              <Value size="display" unit="mmol/L">
                {fasting.length ? oneDecimal(avgFasting) : "—"}
              </Value>
            </div>
            <IconTile tone="red" size={44}>
              <IconDroplet size={20} />
            </IconTile>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Pill tone="teal">
              <IconTrend size={13} />
              {Math.round(inRangeRatio * 100)}% in range
            </Pill>
            <Pill tone="gray">{readings.length} readings logged</Pill>
          </div>
          <div className="mt-4">
            <GlucoseChart readings={readings.slice(0, 14)} />
            <p className="mt-1 text-[11px] text-muted">
              Shaded band is your target: 3.9 – 7.8 mmol/L (fasting and pre-meal).
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Fasting avg"
            value={fasting.length ? oneDecimal(avgFasting) : "—"}
            unit="mmol/L"
            icon={<IconDroplet size={19} />}
            tone="blue"
          />
          <StatTile
            label="Post-meal avg"
            value={oneDecimal(
              readings.filter((r) => r.context === "Post-meal").reduce((n, r) => n + r.value, 0) /
                Math.max(1, readings.filter((r) => r.context === "Post-meal").length),
            )}
            unit="mmol/L"
            icon={<IconTrend size={19} />}
            tone="orange"
          />
        </div>

        {note ? (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <IconTile tone="teal" size={44}>
                <IconClipboard size={20} />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Dietitian note · {dietitianById(note.dietitianId)?.name}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink">{note.assessment}</p>
                <p className="mt-2 text-[11px] text-muted">{prettyDate(note.date)}</p>
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">All readings</h2>
            <CircleButton label="Log a reading" size={36} variant="lime" onClick={() => setOpen(true)}>
              <IconPlus size={18} />
            </CircleButton>
          </div>
          <ul className="divide-y divide-hairline">
            {readings.slice(0, 20).map((r) => {
              const status = glucoseStatus(r.value);
              const toneClass =
                status.tone === "good"
                  ? "bg-teal-tint text-teal"
                  : status.tone === "warn"
                    ? "bg-amber-tint text-amber"
                    : "bg-red-tint text-red";
              return (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <IconTile
                    tone={r.context === "Fasting" ? "blue" : r.context === "Post-meal" ? "orange" : "violet"}
                    size={38}
                  >
                    <IconDroplet size={18} />
                  </IconTile>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold">
                      {oneDecimal(r.value)} <span className="text-[11px] font-normal text-muted">mmol/L</span>
                    </p>
                    <p className="text-[12px] text-muted">
                      {prettyDate(r.date)} · {prettyTime(r.time)} · {r.context}
                    </p>
                    {r.note ? <p className="text-[11px] text-faint">{r.note}</p> : null}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClass}`}>
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <p className="px-1 text-[11px] text-muted">
          Readings older than 90 days stay in your record but drop out of the average. Last 14 days shown
          on the chart covering {prettyDate(last14[0])} – {prettyDate(last14[13])}.
        </p>
      </div>

      <LogGlucoseSheet open={open} onClose={() => setOpen(false)} date={today} />
    </div>
  );
}
