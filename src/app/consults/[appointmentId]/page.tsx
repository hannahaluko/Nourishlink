"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { naira, prettyLongDate, prettyTime } from "@/lib/format";
import { useToast } from "@/components/app-providers";
import { canJoinConsult } from "@/lib/care";
import { Avatar, Card, CircleButton, IconTile, Pill, Sheet, Tag } from "@/components/ui";
import { ChatSheet } from "@/components/log-sheets";
import {
  IconBack,
  IconCalendar,
  IconChat,
  IconCheck,
  IconClipboard,
  IconClock,
  IconLock,
  IconNote,
  IconShield,
  IconVideo,
  IconWallet,
  IconClose,
} from "@/components/icons";

export default function AppointmentDetailPage() {
  const params = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const { appointments, dietitianById, notes, mealPlans, consent, activeRole, clientById } = store;

  const appt = appointments.find((a) => a.id === params.appointmentId);
  const [chatOpen, setChatOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  if (!appt) {
    return (
      <div className="mx-auto max-w-[520px] px-[18px] py-16 text-center">
        <p className="text-[15px] font-semibold">Booking not found</p>
        <Link href="/consults" className="mt-3 inline-block text-[13px] font-semibold text-lime-dark">
          Back to consults
        </Link>
      </div>
    );
  }

  const dietitian = dietitianById(appt.dietitianId);
  const client = clientById(appt.clientId);
  const note = notes.find((n) => n.appointmentId === appt.id);
  const plan = mealPlans.find((p) => p.clientId === appt.clientId);
  const isPast = appt.status === "completed";
  const canJoin = canJoinConsult(appt);

  const rescheduleSlots = (dietitian?.slots ?? [])
    .filter((s) => !s.taken && s.date >= store.today)
    .slice(0, 8);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Booking {appt.reference}</p>
          <h1 className="truncate text-[17px] font-semibold capitalize">
            {appt.status === "pending" ? "Awaiting payment" : appt.status}
          </h1>
        </div>
        <CircleButton label="Cancel booking" size={44} onClick={() => push("Booking kept — nothing changed")}>
          <IconClose size={20} />
        </CircleButton>
      </header>

      <div className="space-y-3">
        {/* Schedule card */}
        <Card className="bg-lime-tint p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Pill tone="lime" className="bg-surface/80">
                {appt.mode === "video" ? <IconVideo size={13} /> : <IconChat size={13} />}
                {appt.mode === "video" ? "Video consult" : "Chat consult"}
              </Pill>
              <p className="mt-3 text-[24px] font-bold leading-tight">{prettyTime(appt.time)}</p>
              <p className="text-[13px] text-ink/70">{prettyLongDate(appt.date)}</p>
            </div>
            <IconTile tone="lime" size={46} shape="circle" className="bg-surface/80">
              <IconCalendar size={21} />
            </IconTile>
          </div>
          {appt.reason ? (
            <p className="mt-3 rounded-[16px] bg-surface/70 p-3 text-[12px] text-ink">
              <span className="font-semibold">Your focus: </span>
              {appt.reason}
            </p>
          ) : null}
        </Card>

        {/* Dietitian */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Avatar name={dietitian?.name ?? "Dietitian"} size={50} tone="blue" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{dietitian?.name}</p>
              <p className="truncate text-[12px] text-muted">{dietitian?.headline}</p>
            </div>
            <Pill tone="gray">{naira(appt.fee)}</Pill>
          </div>

          {activeRole === "dietitian" && client ? (
            <div className="mt-3 rounded-[16px] bg-canvas p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Client</p>
              <p className="text-[14px] font-semibold">{client.name}</p>
              <p className="text-[12px] text-muted">
                {client.goals.join(" · ")} · {client.conditions.join(", ")}
              </p>
              {client.allergies.length ? (
                <p className="mt-1 text-[11px] font-medium text-red">Allergies: {client.allergies.join(", ")}</p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="press flex items-center justify-center gap-2 rounded-[16px] bg-canvas py-3 text-[13px] font-semibold"
            >
              <IconChat size={16} />
              Ask a question
            </button>
            <Link
              href={`/consult/room/${appt.id}`}
              aria-disabled={!canJoin}
              className={`press flex items-center justify-center gap-2 rounded-[16px] py-3 text-[13px] font-semibold ${
                canJoin ? "bg-lime text-white" : "bg-canvas text-faint"
              }`}
            >
              <IconVideo size={16} />
              {canJoin ? "Join room" : "Locked"}
            </Link>
          </div>
        </Card>

        {/* Payment / status */}
        <Card className="p-4">
          <h2 className="text-[16px] font-semibold">Payment</h2>
          <div className="mt-2 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-muted">Consult fee</span>
              <span className="tnum font-semibold">{naira(appt.fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span
                className={`font-semibold ${
                  appt.payment === "paid" ? "text-teal" : appt.payment === "refunded" ? "text-red" : "text-amber"
                }`}
              >
                {appt.payment === "paid" ? "Paid" : appt.payment === "refunded" ? "Refunded" : "Unpaid"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Reference</span>
              <span className="font-medium">{appt.reference}</span>
            </div>
          </div>

          {appt.payment === "unpaid" ? (
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="press mt-3 w-full rounded-full bg-lime py-3.5 text-[14px] font-semibold text-white"
            >
              Pay now
            </button>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setRescheduleOpen(true)}
                className="press flex-1 rounded-full bg-canvas py-3 text-[13px] font-semibold"
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => {
                  store.cancelAppointment(appt.id);
                  push("Booking cancelled · refund in 3–5 days");
                }}
                className="press flex-1 rounded-full bg-red-tint py-3 text-[13px] font-semibold text-red"
              >
                Cancel
              </button>
            </div>
          )}
        </Card>

        {/* Session notes (after completion) */}
        {isPast && note ? (
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <IconTile tone="teal" size={40}>
                <IconNote size={19} />
              </IconTile>
              <div>
                <h2 className="text-[15px] font-semibold">Session notes</h2>
                <p className="text-[12px] text-muted">Written by {dietitian?.name}</p>
              </div>
            </div>
            <dl className="mt-3 space-y-2.5 text-[13px] leading-relaxed">
              {[
                ["What you reported", note.subjective],
                ["Assessment", note.assessment],
                ["Plan agreed", note.plan],
              ].map(([label, body]) => (
                <div key={label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</dt>
                  <dd className="mt-0.5 text-ink">{body}</dd>
                </div>
              ))}
            </dl>
            {plan ? (
              <Link
                href="/meal-plans"
                className="press mt-3 flex items-center justify-center gap-2 rounded-full bg-lime-tint py-3 text-[13px] font-semibold text-lime-dark"
              >
                <IconClipboard size={16} />
                Open assigned meal plan
              </Link>
            ) : null}
          </Card>
        ) : null}

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <IconTile tone="gray" size={40}>
              <IconShield size={19} />
            </IconTile>
            <div className="flex-1">
              <p className="text-[13px] font-semibold">Shared health record</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {consent.shareWithDietitian
                  ? `Logs and profile are visible to ${dietitian?.name.split(" ")[0]} until you revoke access.`
                  : "Sharing is off — your dietitian cannot see your logs."}
              </p>
              <Link href="/profile" className="mt-2 inline-block text-[12px] font-semibold text-lime-dark">
                Manage consent
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} appointmentId={appt.id} />

      <Sheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Complete payment"
        footer={
          <button
            type="button"
            onClick={() => {
              store.payAppointment(appt.id);
              setPayOpen(false);
              push("Payment successful · booking confirmed");
            }}
            className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
          >
            Pay {naira(appt.fee)}
          </button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-[18px] bg-canvas p-3.5">
            <IconTile tone="blue" size={42}>
              <IconWallet size={19} />
            </IconTile>
            <div className="flex-1">
              <p className="text-[14px] font-semibold">Card ending 4291</p>
              <p className="text-[11px] text-muted">Test mode · no real charge</p>
            </div>
            <IconCheck size={18} className="text-lime-dark" />
          </div>
          <p className="flex items-center gap-2 text-[11px] text-muted">
            <IconLock size={13} />
            Your payment details are handled by the payment provider, never stored by NourishLink.
          </p>
        </div>
      </Sheet>

      <Sheet open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Reschedule consult">
        <p className="text-[13px] text-muted">
          Free changes up to 12 hours before the session. Pick a new slot with {dietitian?.name}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {rescheduleSlots.map((s) => (
            <Tag
              key={s.id}
              onClick={() => {
                setRescheduleOpen(false);
                push(`Reschedule request sent for ${prettyTime(s.time)}`);
              }}
            >
              {s.date.slice(5)} · {prettyTime(s.time)}
            </Tag>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-[11px] text-muted">
          <IconClock size={13} />
          Your dietitian is notified instantly and the reminder updates automatically.
        </p>
      </Sheet>
    </div>
  );
}
