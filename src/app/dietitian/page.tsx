"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { DEMO_DIETITIAN_ID } from "@/lib/seed";
import { glucoseStatus, num, pct, prettyDate, prettyTime } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { Avatar, Card, CircleButton, IconTile, Pill, ProgressBar, SectionHeader, StatTile } from "@/components/ui";
import {
  IconBell,
  IconCalendar,
  IconCheck,
  IconChat,
  IconClipboard,
  IconDroplet,
  IconNote,
  IconTrend,
  IconUser,
  IconVerified,
  IconVideo,
  IconClose,
  IconArrowRight,
} from "@/components/icons";

export default function DietitianDashboard() {
  const store = useStore();
  const { push } = useToast();
  const { clients, appointments, glucoseFor, mealsFor, notes, today, profile } = store;
  const me = store.dietitianById(DEMO_DIETITIAN_ID);

  const myClients = clients.filter((c) => c.id !== profile.id || store.clientById(c.id));
  const myAppointments = appointments.filter((a) => a.dietitianId === DEMO_DIETITIAN_ID);
  const todays = [...myAppointments]
    .filter((a) => a.date >= today && a.status !== "cancelled")
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 4);
  const pending = myAppointments.filter((a) => a.status === "pending");

  const adherence = (clientId: string) => {
    const recent = store.mealsFor(clientId).filter((m) => m.date >= store.today.slice(0, 8) + "01");
    const readings = glucoseFor(clientId).filter((g) => glucoseStatus(g.value).tone === "good");
    const glucoseScore = readings.length / Math.max(1, glucoseFor(clientId).length);
    return Math.round(((recent.length > 0 ? 0.85 : 0.4) * 0.5 + glucoseScore * 0.5) * 100);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <Avatar name={me?.name ?? "Dietitian"} size={46} tone="teal" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Good morning,</p>
          <h1 className="truncate text-[17px] font-semibold">Dr. {me?.name.split(" ")[0]}</h1>
        </div>
        <CircleButton label="Notifications" href="/profile" size={44}>
          <IconBell size={20} />
        </CircleButton>
        <CircleButton label="Availability" href="/dietitian/schedule" size={44}>
          <IconCalendar size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        {/* Verification */}
        <Card className="flex items-center gap-3 p-4">
          <IconTile tone="lime" size={42}>
            <IconVerified size={20} />
          </IconTile>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">Licence {me?.verification.licenceNo} verified</p>
            <p className="text-[11px] text-muted">
              Approved {me?.verification.verifiedAt?.slice(0, 10)} · renews annually
            </p>
          </div>
          <Pill tone="teal">Active</Pill>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Active clients"
            value={`${clients.length}`}
            unit="on caseload"
            icon={<IconUser size={19} />}
            tone="blue"
            footer={<ProgressBar value={pct(clients.length, 20)} tone="blue" />}
          />
          <StatTile
            label="Consults this week"
            value={`${myAppointments.filter((a) => a.date >= today).length}`}
            unit="booked"
            icon={<IconVideo size={19} />}
            tone="lime"
          />
          <StatTile
            label="Notes to write"
            value={`${Math.max(0, myAppointments.filter((a) => a.status === "completed").length - notes.length)}`}
            unit="pending"
            icon={<IconNote size={19} />}
            tone="orange"
          />
          <StatTile
            label="Avg adherence"
            value={`${Math.round(clients.reduce((n, c) => n + adherence(c.id), 0) / Math.max(1, clients.length))}%`}
            unit="last 30 days"
            icon={<IconTrend size={19} />}
            tone="teal"
          />
        </div>

        {/* Pending bookings */}
        {pending.length ? (
          <Card className="p-4">
            <SectionHeader title="Booking requests" className="mb-2" />
            <ul className="divide-y divide-hairline">
              {pending.map((a) => {
                const client = store.clientById(a.clientId);
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <Avatar name={client?.name ?? "Client"} size={40} tone="violet" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{client?.name}</p>
                      <p className="text-[11px] text-muted">
                        {prettyDate(a.date)} · {prettyTime(a.time)} · {a.mode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        store.updateAppointment(a.id, { status: "confirmed", payment: "paid" });
                        push("Booking confirmed");
                      }}
                      aria-label="Accept booking"
                      className="press grid h-9 w-9 place-items-center rounded-full bg-lime text-white"
                    >
                      <IconCheck size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => store.cancelAppointment(a.id)}
                      aria-label="Decline booking"
                      className="press grid h-9 w-9 place-items-center rounded-full bg-canvas text-muted"
                    >
                      <IconClose size={17} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        ) : null}

        {/* Today */}
        <Card className="p-4">
          <SectionHeader title="Next sessions" href="/consults" action="All" className="mb-1" />
          {todays.length ? (
            <ul className="divide-y divide-hairline">
              {todays.map((a) => {
                const client = store.clientById(a.clientId);
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <IconTile tone={a.mode === "video" ? "lime" : "violet"} size={42}>
                      {a.mode === "video" ? <IconVideo size={19} /> : <IconChat size={19} />}
                    </IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold">{client?.name}</p>
                      <p className="text-[11px] text-muted">
                        {prettyDate(a.date)} · {prettyTime(a.time)} · {a.reason.slice(0, 42)}
                      </p>
                    </div>
                    <CircleButton label="Open session" href={`/dietitian/clients/${a.clientId}`} size={34} className="bg-canvas">
                      <IconArrowRight size={16} />
                    </CircleButton>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-4 text-center text-[13px] text-muted">
              No sessions booked yet. Publish more availability to fill the week.
            </p>
          )}
        </Card>

        {/* Caseload */}
        <Card className="p-4">
          <SectionHeader title="Caseload" className="mb-2" />
          <ul className="space-y-2">
            {clients.map((c) => {
              const glucose = glucoseFor(c.id);
              const latest = glucose[0];
              const lastMeal = mealsFor(c.id).at(-1);
              return (
                <li key={c.id}>
                  <Link
                    href={`/dietitian/clients/${c.id}`}
                    className="press flex items-center gap-3 rounded-[18px] bg-canvas p-3"
                  >
                    <Avatar name={c.name} size={44} tone={c.id === "u_kunle" ? "orange" : "blue"} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-semibold">{c.name}</span>
                        {store.consent.shareWithDietitian ? (
                          <IconVerified size={13} className="shrink-0 text-lime-dark" />
                        ) : null}
                      </span>
                      <span className="block truncate text-[11px] text-muted">
                        {c.conditions.join(", ")}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {latest ? (
                          <Pill
                            tone={
                              glucoseStatus(latest.value).tone === "good"
                                ? "teal"
                                : glucoseStatus(latest.value).tone === "warn"
                                  ? "amber"
                                  : "red"
                            }
                          >
                            <IconDroplet size={11} />
                            {latest.value.toFixed(1)} mmol/L
                          </Pill>
                        ) : null}
                        <Pill tone="gray">{adherence(c.id)}% adherence</Pill>
                      </span>
                      <span className="mt-1 block text-[11px] text-muted">
                        Last log: {lastMeal ? `${lastMeal.title} · ${prettyDate(lastMeal.date)}` : "none"}
                      </span>
                    </span>
                    <IconArrowRight size={18} className="text-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Quick actions" className="mb-2" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Write a note", href: `/dietitian/clients/${clients[0]?.id ?? ""}`, icon: <IconNote size={18} />, tone: "orange" as const },
              { label: "Assign a plan", href: `/dietitian/clients/${clients[0]?.id ?? ""}`, icon: <IconClipboard size={18} />, tone: "teal" as const },
              { label: "Set availability", href: "/dietitian/schedule", icon: <IconCalendar size={18} />, tone: "blue" as const },
              { label: "Open tracking", href: "/track", icon: <IconTrend size={18} />, tone: "violet" as const },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="press flex items-center gap-2.5 rounded-[16px] bg-canvas p-3 text-[13px] font-semibold"
              >
                <IconTile tone={a.tone} size={34}>
                  {a.icon}
                </IconTile>
                {a.label}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Caseload data is only visible for clients who consented to share. Revoked clients disappear from
            this list immediately.
          </p>
        </Card>

        <p className="px-1 text-[11px] text-muted">
          {num(clients.length)} clients · {myAppointments.length} consults on record ·{" "}
          {store.notes.length} session notes saved
        </p>
      </div>
    </div>
  );
}
