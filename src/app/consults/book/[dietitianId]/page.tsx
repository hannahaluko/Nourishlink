"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { naira, prettyDate, prettyLongDate, prettyTime } from "@/lib/format";
import type { ConsultMode } from "@/lib/types";
import { useToast } from "@/components/app-providers";
import { Card, CircleButton, IconTile, Pill, Sheet, Tag, Avatar } from "@/components/ui";
import {
  IconBack,
  IconCardPay,
  IconChat,
  IconCheck,
  IconClock,
  IconLock,
  IconPin,
  IconShield,
  IconStar,
  IconVideo,
  IconWallet,
  IconChat as IconChatBubble,
} from "@/components/icons";

const PAY_METHODS = [
  { id: "card", label: "Card", hint: "Visa, Mastercard, Verve", icon: <IconCardPay size={20} />, tone: "blue" as const },
  { id: "transfer", label: "Bank transfer", hint: "Pay from your bank app", icon: <IconWallet size={20} />, tone: "teal" as const },
  { id: "ussd", label: "USSD", hint: "Dial a code to pay", icon: <IconLock size={20} />, tone: "violet" as const },
];

export default function DietitianProfilePage() {
  const params = useParams<{ dietitianId: string }>();
  const router = useRouter();
  const store = useStore();
  const { push } = useToast();
  const { dietitians, profile, today } = store;
  const dietitian = dietitians.find((d) => d.id === params.dietitianId);

  const [mode, setMode] = useState<ConsultMode>("video");
  const [date, setDate] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [checkout, setCheckout] = useState(false);
  const [method, setMethod] = useState("card");
  const [paying, setPaying] = useState(false);
  const [booked, setBooked] = useState<{ id: string; reference: string } | null>(null);

  const openSlots = useMemo(
    () => (dietitian?.slots ?? []).filter((s) => !s.taken && s.date >= today),
    [dietitian, today],
  );
  const dates = useMemo(
    () => Array.from(new Set(openSlots.map((s) => s.date))).slice(0, 7),
    [openSlots],
  );
  const activeDate = date ?? dates[0] ?? null;
  const daySlots = openSlots.filter((s) => s.date === activeDate && s.mode === mode);
  const selectedSlot = openSlots.find((s) => s.id === slotId) ?? null;

  if (!dietitian) {
    return (
      <div className="mx-auto max-w-[520px] px-[18px] py-16 text-center">
        <p className="text-[15px] font-semibold">Dietitian not found</p>
        <Link href="/consults/book" className="mt-3 inline-block text-[13px] font-semibold text-lime-dark">
          Back to search
        </Link>
      </div>
    );
  }

  const matched = dietitian.focus.filter(
    (f) => profile.conditions.includes(f as never) || profile.goals.includes(f as never),
  );

  const startPayment = () => {
    if (!selectedSlot) {
      push("Pick a time slot first");
      return;
    }
    setCheckout(true);
  };

  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      const appointment = store.bookAppointment({
        dietitianId: dietitian.id,
        date: selectedSlot!.date,
        time: selectedSlot!.time,
        mode,
        reason:
          reason.trim() ||
          `Review of my ${profile.conditions.join(", ").toLowerCase()} management and meal plan.`,
      });
      store.payAppointment(appointment.id);
      setPaying(false);
      setCheckout(false);
      setBooked({ id: appointment.id, reference: appointment.reference });
    }, 900);
  };

  /* ------------------------------ confirmation ------------------------------ */
  if (booked) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
        <div className="anim-fade-up space-y-3 pt-8">
          <Card className="flex flex-col items-center gap-3 p-6 text-center">
            <IconTile tone="lime" size={62} shape="circle">
              <IconCheck size={28} />
            </IconTile>
            <h1 className="text-[19px] font-bold">Consult booked</h1>
            <p className="text-[13px] text-muted">
              {prettyLongDate(activeDate!)}, {prettyTime(selectedSlot?.time ?? "10:00")} with{" "}
              {dietitian.name}.
            </p>
            <div className="mt-1 flex flex-wrap justify-center gap-1.5">
              <Pill tone="teal">
                <IconCheck size={13} />
                Paid {naira(dietitian.fee)}
              </Pill>
              <Pill tone="gray">Ref {booked.reference}</Pill>
            </div>
            <p className="mt-2 rounded-[16px] bg-canvas p-3 text-[12px] text-muted">
              A confirmation was sent to {profile.email}. Your health profile and logs are shared with{" "}
              {dietitian.name.split(" ")[0]} — you can revoke sharing any time in Profile.
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="text-[16px] font-semibold">What happens next</h2>
            <ol className="mt-2 space-y-2.5">
              {[
                "You get a reminder 24 hours and 15 minutes before the session.",
                "Your dietitian reviews your glucose, weight and meal logs beforehand.",
                "Join from the consults tab — no downloads needed.",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-tint text-[11px] font-bold text-lime-dark">
                    {i + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/consults/${booked.id}`}
              className="press rounded-full bg-lime py-3.5 text-center text-[14px] font-semibold text-white"
            >
              View booking
            </Link>
            <Link
              href="/consults"
              className="press rounded-full bg-surface py-3.5 text-center text-[14px] font-semibold"
            >
              All consults
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[520px] px-[18px] pb-[132px]">
      <header className="flex items-center gap-3 pt-5 pb-4">
        <CircleButton label="Back" size={44} onClick={() => router.back()}>
          <IconBack size={20} />
        </CircleButton>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Verified dietitian</p>
          <h1 className="truncate text-[17px] font-semibold">{dietitian.name}</h1>
        </div>
      </header>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Avatar name={dietitian.name} size={62} tone="lime" />
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold">{dietitian.name}</p>
              <p className="mt-0.5 text-[12px] text-muted">{dietitian.headline}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Pill tone="lime">
                  <IconStar size={13} />
                  {dietitian.rating ? dietitian.rating.toFixed(1) : "New"} · {dietitian.reviews} reviews
                </Pill>
                <Pill tone="gray">{dietitian.years} yrs experience</Pill>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-[12px] text-muted">
            <p className="flex items-center gap-1.5">
              <IconPin size={13} />
              {dietitian.city}
            </p>
            <p className="flex items-center gap-1.5">
              <IconShield size={13} className="text-lime-dark" />
              Licence {dietitian.verification.licenceNo} · verified by NourishLink admin
            </p>
            <p className="flex items-center gap-1.5">
              <IconChatBubble size={13} />
              Speaks {dietitian.languages.join(", ")}
            </p>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-ink">{dietitian.bio}</p>
        </Card>

        <Card className="p-4">
          <h2 className="text-[16px] font-semibold">Works with</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dietitian.focus.map((f) => (
              <Pill key={f} tone={matched.includes(f) ? "lime" : "gray"}>
                {f}
              </Pill>
            ))}
          </div>
          {matched.length ? (
            <p className="mt-3 rounded-[16px] bg-lime-tint p-3 text-[12px] text-ink">
              Matches your profile: {matched.join(", ")}. {dietitian.name.split(" ")[0]} will see your goals,
              conditions and allergies before the session.
            </p>
          ) : null}
        </Card>

        {/* Slot picker */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Pick a slot</h2>
            <span className="flex gap-2">
              {(["video", "chat"] as ConsultMode[]).map((m) => (
                <Tag key={m} active={mode === m} onClick={() => { setMode(m); setSlotId(null); }}>
                  {m === "video" ? "Video" : "Chat"}
                </Tag>
              ))}
            </span>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {dates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDate(d);
                  setSlotId(null);
                }}
                aria-pressed={activeDate === d}
                className={`press flex min-w-[58px] flex-col items-center gap-1 rounded-[16px] px-3 py-2.5 ${
                  activeDate === d ? "bg-lime-tint" : "bg-canvas"
                }`}
              >
                <span className="text-[10px] font-medium text-muted">{prettyDate(d).split(",")[0]}</span>
                <span className="text-[16px] font-semibold">{Number(d.slice(-2))}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {(daySlots.length ? daySlots : openSlots.filter((s) => s.date === activeDate)).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setMode(s.mode);
                  setSlotId(s.id);
                }}
                aria-pressed={slotId === s.id}
                className={`press flex flex-col items-center gap-1 rounded-[14px] py-2.5 text-[13px] font-semibold ${
                  slotId === s.id ? "bg-lime text-white" : "bg-canvas text-ink"
                }`}
              >
                {prettyTime(s.time)}
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                    slotId === s.id ? "text-white/85" : "text-muted"
                  }`}
                >
                  {s.mode === "video" ? <IconVideo size={11} /> : <IconChat size={11} />}
                  {s.mode}
                </span>
              </button>
            ))}
          </div>

          {daySlots.length === 0 ? (
            <p className="mt-3 text-center text-[12px] text-muted">
              No {mode} slots left on {activeDate ? prettyDate(activeDate) : "this day"} — try another day or
              switch mode.
            </p>
          ) : null}
        </Card>

        <Card className="p-4">
          <h2 className="text-[16px] font-semibold">What would you like to focus on?</h2>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. My fasting glucose is still high in the mornings and I want to fix breakfast."
            className="mt-2 w-full rounded-[16px] bg-canvas px-3.5 py-3 text-[13px] outline-none placeholder:text-faint focus:ring-2 focus:ring-lime/60"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Blood sugar control", "Weight loss", "Meal plan review", "Eating out tips"].map((t) => (
              <Tag key={t} onClick={() => setReason(t)}>
                {t}
              </Tag>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-[16px] font-semibold">Summary</h2>
          <dl className="mt-2 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">Consult fee</dt>
              <dd className="tnum font-semibold">{naira(dietitian.fee)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Slot</dt>
              <dd className="font-medium">
                {selectedSlot
                  ? `${prettyDate(selectedSlot.date)}, ${prettyTime(selectedSlot.time)}`
                  : "Not selected"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Mode</dt>
              <dd className="font-medium capitalize">{mode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Follow-up messages</dt>
              <dd className="font-medium">Included for 14 days</dd>
            </div>
          </dl>
          <p className="mt-3 flex items-start gap-2 rounded-[16px] bg-canvas p-3 text-[11px] text-muted">
            <IconShield size={14} className="mt-0.5 shrink-0 text-lime-dark" />
            Booking shares your health profile and logs with {dietitian.name} for the duration of your care.
            Read the{" "}
            <Link href="/privacy" className="font-semibold text-lime-dark">
              privacy policy
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={startPayment}
            className="press mt-3 w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white"
          >
            Continue to payment · {naira(dietitian.fee)}
          </button>
        </Card>
      </div>

      <Sheet
        open={checkout}
        onClose={() => setCheckout(false)}
        title="Confirm and pay"
        footer={
          <button
            type="button"
            onClick={pay}
            disabled={paying}
            className="press w-full rounded-full bg-lime py-3.5 text-[15px] font-semibold text-white disabled:opacity-70"
          >
            {paying ? "Processing…" : `Pay ${naira(dietitian.fee)}`}
          </button>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-[18px] bg-canvas p-3.5">
            <IconTile tone="lime" size={42} shape="circle">
              {mode === "video" ? <IconVideo size={19} /> : <IconChat size={19} />}
            </IconTile>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{dietitian.name}</p>
              <p className="text-[12px] text-muted">
                {selectedSlot
                  ? `${prettyDate(selectedSlot.date)} · ${prettyTime(selectedSlot.time)}`
                  : "No slot"}
              </p>
            </div>
            <p className="tnum text-[14px] font-semibold">{naira(dietitian.fee)}</p>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-[12px] font-medium text-muted">Payment method</legend>
            {PAY_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                aria-pressed={method === m.id}
                className={`press flex w-full items-center gap-3 rounded-[16px] p-3 text-left ${
                  method === m.id ? "bg-lime-tint" : "bg-canvas"
                }`}
              >
                <IconTile tone={m.tone} size={38}>
                  {m.icon}
                </IconTile>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{m.label}</span>
                  <span className="block text-[11px] text-muted">{m.hint}</span>
                </span>
                {method === m.id ? <IconCheck size={18} className="text-lime-dark" /> : null}
              </button>
            ))}
          </fieldset>

          <p className="flex items-center gap-2 rounded-[16px] bg-canvas p-3 text-[11px] text-muted">
            <IconClock size={14} className="shrink-0" />
            Test mode: no real charge is made. Cancel free up to 12 hours before the session for a full
            refund.
          </p>
        </div>
      </Sheet>
    </div>
  );
}
