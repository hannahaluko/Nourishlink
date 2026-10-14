"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { DEMO_DIETITIAN_ID } from "@/lib/seed";
import { naira, prettyDate, prettyTime } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Avatar, Card, CircleButton, IconTile, Pill, SectionHeader, Tag } from "@/components/ui";
import {
  IconBack,
  IconCalendar,
  IconCheck,
  IconChat,
  IconClock,
  IconLock,
  IconVideo,
  IconPlus,
} from "@/components/icons";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["08:00", "09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"];

export default function SchedulePage() {
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const me = store.dietitianById(DEMO_DIETITIAN_ID);

  const initial = new Set<string>();
  me?.slots.forEach((s) => initial.add(`${s.day}-${s.time}`));
  const [open, setOpen] = useState<Set<string>>(initial);
  const [mode, setMode] = useState<"video" | "chat">("video");
  const [fee, setFee] = useState(me?.fee ?? 18000);
  const [consultLength, setConsultLength] = useState(30);

  const toggle = (day: string, time: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      const key = `${day}-${time}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const bookings = store.appointments
    .filter((a) => a.dietitianId === DEMO_DIETITIAN_ID && a.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const slotsOpen = open.size;
  const potential = slotsOpen * fee;

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Your practise</p>
          <h1 className="truncate text-[17px] font-semibold">Availability</h1>
        </div>
        <CircleButton label="Publish" size={44} variant="lime" onClick={() => push(`${slotsOpen} slots published`)}>
          <IconCheck size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        <Card className="bg-lime-tint p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Pill tone="lime" className="bg-surface/80">
                <IconCalendar size={13} />
                This week&apos;s pattern
              </Pill>
              <p className="mt-3 text-[24px] font-bold leading-none">{slotsOpen} slots</p>
              <p className="mt-1 text-[12px] text-ink/70">
                Repeats weekly until you change it · {naira(potential)} potential
              </p>
            </div>
            <IconTile tone="lime" size={46} shape="circle" className="bg-surface/80">
              <IconClock size={21} />
            </IconTile>
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Consult settings" className="mb-3" />
          <div className="flex gap-2">
            {(["video", "chat"] as const).map((m) => (
              <Tag key={m} active={mode === m} onClick={() => setMode(m)}>
                {m === "video" ? "Video consults" : "Chat consults"}
              </Tag>
            ))}
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-muted">Fee per consult</span>
                <span className="tnum text-[13px] font-semibold">{naira(fee)}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={25000}
                step={1000}
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                aria-label="Consult fee"
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-hatch accent-lime"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-muted">Session length</span>
                <span className="tnum text-[13px] font-semibold">{consultLength} min</span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={consultLength}
                onChange={(e) => setConsultLength(Number(e.target.value))}
                aria-label="Session length"
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-hatch accent-lime"
              />
            </div>
          </div>
        </Card>

        {/* Grid */}
        <Card className="overflow-hidden p-4">
          <SectionHeader title="Weekly grid" className="mb-3" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="w-[54px]" />
                  {DAYS.map((d) => (
                    <th key={d} className="text-[11px] font-medium text-muted">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map((t) => (
                  <tr key={t}>
                    <td className="pr-1 text-right text-[10px] text-muted">{t}</td>
                    {DAYS.map((d) => {
                      const on = open.has(`${d}-${t}`);
                      return (
                        <td key={`${d}-${t}`}>
                          <button
                            type="button"
                            onClick={() => toggle(d, t)}
                            aria-pressed={on}
                            aria-label={`${d} ${t}`}
                            className={`press h-7 w-full rounded-[8px] ${
                              on ? "bg-lime" : "bg-canvas"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Tap a cell to open or close a slot. Clients can only book slots that are open and not taken.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(new Set())}
              className="press flex-1 rounded-full bg-canvas py-2.5 text-[12px] font-semibold"
            >
              Clear week
            </button>
            <button
              type="button"
              onClick={() => {
                const next = new Set<string>();
                DAYS.forEach((d) => ["09:00", "10:30", "15:00", "16:30"].forEach((t) => next.add(`${d}-${t}`)));
                setOpen(next);
                push("Standard week applied");
              }}
              className="press flex-1 rounded-full bg-lime-wash py-2.5 text-[12px] font-semibold text-lime-dark"
            >
              Standard week
            </button>
            <button
              type="button"
              onClick={() => push("Time off blocked for this week")}
              className="press flex-1 rounded-full bg-red-tint py-2.5 text-[12px] font-semibold text-red"
            >
              Block time off
            </button>
          </div>
        </Card>

        {/* Booked */}
        <Card className="p-4">
          <SectionHeader title="Booked sessions" href="/consults" action="All" className="mb-1" />
          <ul className="divide-y divide-hairline">
            {bookings.map((a) => {
              const client = store.clientById(a.clientId);
              return (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <Avatar name={client?.name ?? "Client"} size={40} tone="violet" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{client?.name}</p>
                    <p className="text-[11px] text-muted">
                      {prettyDate(a.date)} · {prettyTime(a.time)} · {naira(a.fee)}
                    </p>
                  </div>
                  <Pill tone={a.status === "confirmed" ? "teal" : a.status === "pending" ? "amber" : "gray"}>
                    {a.status}
                  </Pill>
                  {a.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() => {
                        store.updateAppointment(a.id, { status: "confirmed" });
                        push("Booking confirmed");
                      }}
                      aria-label="Accept booking"
                      className="press grid h-8 w-8 place-items-center rounded-full bg-lime text-white"
                    >
                      <IconCheck size={15} />
                    </button>
                  ) : (
                    <Link
                      href={`/consult/room/${a.id}`}
                      aria-label="Open room"
                      className="press grid h-8 w-8 place-items-center rounded-full bg-canvas text-muted"
                    >
                      {a.mode === "video" ? <IconVideo size={15} /> : <IconChat size={15} />}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="flex items-start gap-3 p-4">
          <IconTile tone="gray" size={40}>
            <IconLock size={19} />
          </IconTile>
          <p className="text-[12px] text-muted">
            Availability changes apply to new bookings only. Existing consultations keep the time your client
            already paid for.
          </p>
        </Card>

        <Link
          href="/dietitian"
          className="press flex w-full items-center justify-center gap-2 rounded-full bg-surface py-3.5 text-[14px] font-semibold"
        >
          <IconPlus size={18} />
          Back to caseload
        </Link>
      </div>
    </div>
  );
}
